import { Controller, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import Redis from 'ioredis';
import { KafkaGateway } from './kafka.gateway';
import { CestasService } from '../cestas/cestas.service';

@Controller()
export class DebeziumListenerService implements OnModuleInit, OnModuleDestroy {
  private redisPub: Redis;
  private redisSub: Redis;

  constructor(
    private wsGateway: KafkaGateway,
    private readonly cestasService: CestasService,
  ) {}

  onModuleInit() {
    this.redisPub = new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: Number(process.env.REDIS_PORT) || 6379,
    });

    this.redisSub = new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: Number(process.env.REDIS_PORT) || 6379,
    });

    this.redisSub.psubscribe('R*:CX-*', (err) => {
      if (err) console.error('Erro ao subscrever Redis:', err);
      else console.log('Subscrito nos canais de caixas');
    });

    this.redisSub.on('pmessage', (pattern, channel, message) => {
      const evento = JSON.parse(message as string);
      this.wsGateway.emitirParaSala(channel as string, evento);
      console.log(`Repassado do Redis para sala ${channel} via socket!`);
    });
  }

  async onModuleDestroy() {
    if (this.redisPub) await this.redisPub.quit();
    if (this.redisSub) await this.redisSub.quit();
  }

  @EventPattern('dbserver1.public.cestas')
  async handleDebeziumCestasEvent(@Payload() data: any) {
    await this.publicarEventoDebezium(data, 'cestas');
  }

  @EventPattern('dbserver1.public.cesta_produtos')
  async handleDebeziumCestaProdutosEvent(@Payload() data: any) {
    await this.publicarEventoDebezium(data, 'cesta_produtos');
  }

  private async publicarEventoDebezium(
    data: any,
    nomeTabelaPadrao = 'desconhecida',
  ) {
    if (!data || !data.payload) return;

    const { before, after, op, source, ts_ms } = data.payload;
    const operacao =
      op === 'c'
        ? 'CREATE'
        : op === 'u'
          ? 'UPDATE'
          : op === 'd'
            ? 'DELETE'
            : op;

    const loja = 'R02';
    const caixa = before?.caixa_id || after?.caixa_id || '01';
    const canal = `${loja}:CX-${String(caixa).padStart(2, '0')}`;

    let afterEnriquecido = after;
    if (nomeTabelaPadrao === 'cesta_produtos' && after) {
      // Buscar dados do produto
      try {
        const produtoId = after.produto_id;
        const produto = await this.cestasService['produtoRepo'].findOneBy({
          id: produtoId,
        });
        let preco: number | null = null;

        // Decodifica se vier em base64, senão pega do banco
        if (after.preco_unitario) {
          try {
            preco = Buffer.from(after.preco_unitario, 'base64').readFloatLE(0);
          } catch {
            preco = Number(after.preco_unitario) || produto?.preco || null;
          }
        } else {
          preco = produto?.preco || null;
        }

        afterEnriquecido = {
          ...after,
          nome_produto: produto?.nome ?? null,
          preco_unitario: preco,
        };
      } catch (err) {
        console.error('Erro buscando dados do produto:', err);
      }
    }

    const eventoJson = {
      evento: operacao,
      tabela: source?.table || nomeTabelaPadrao,
      dataEvento: ts_ms,
      before: before || null,
      after: afterEnriquecido || null,
      origem: {
        db: source?.db || null,
        schema: source?.schema || null,
        txId: source?.txId || null,
      },
    };

    await this.redisPub.publish(canal, JSON.stringify(eventoJson));
    console.log(
      `Publicado no canal ${canal}:`,
      JSON.stringify(eventoJson, null, 2),
    );
  }
}
