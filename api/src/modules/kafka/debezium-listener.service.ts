import { Controller, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import Redis from 'ioredis';
import { KafkaGateway } from './kafka.gateway';
import { CestasService } from '../cestas/cestas.service';

@Controller()
export class DebeziumListenerService implements OnModuleInit, OnModuleDestroy {
  private redisStream: Redis;
  private readonly esquemaPadrao = 'public';

  constructor(
    private wsGateway: KafkaGateway,
    private readonly cestasService: CestasService,
  ) {}

  async onModuleInit() {
    this.redisStream = new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: Number(process.env.REDIS_PORT) || 6379,
    });

    // Exemplo de canal; para múltiplos canais, crie groups dinamicamente
    const exemploCanal = 'R02:CX-01';
    const streamKey = `stream:${exemploCanal}`;
    const groupName = 'cestas-consumidores';

    // Cria o consumer group, se não existir
    try {
      await this.redisStream.xgroup(
        'CREATE',
        streamKey,
        groupName,
        '$', // consome só novas mensagens
        'MKSTREAM',
      );
      console.log(`Grupo criado em ${streamKey}/${groupName}`);
    } catch (err: any) {
      if (err.message.includes('BUSYGROUP')) {
        console.log(`Grupo já existe: ${streamKey}/${groupName}`);
      } else {
        console.error('Erro criando consumer group:', err);
        throw err;
      }
    }

    // Inicia o loop de consumo
    void this.startStreamConsumer(exemploCanal, groupName);
  }

  async onModuleDestroy() {
    if (this.redisStream) await this.redisStream.quit();
  }

  @EventPattern('dbserver1.public.cestas')
  async handleCestasEvent(@Payload() data: any) {
    await this.publicarNoStream(data, 'cestas');
  }

  @EventPattern('dbserver1.public.cesta_produtos')
  async handleProdutosEvent(@Payload() data: any) {
    await this.publicarNoStream(data, 'cesta_produtos');
  }

  private async publicarNoStream(data: any, tabela: string) {
    if (!data?.payload) return;
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
    const streamKey = `stream:${canal}`;

    // Enriquecer payload se necessário
    let afterEnriquecido = after;
    if (tabela === 'cesta_produtos' && after) {
      try {
        const produto = await this.cestasService['produtoRepo'].findOneBy({
          id: after.produto_id,
        });
        let preco = produto?.preco || null;
        if (after.preco_unitario) {
          try {
            preco = Buffer.from(after.preco_unitario, 'base64').readFloatLE(0);
          } catch {
            preco = Number(after.preco_unitario) || preco;
          }
        }
        afterEnriquecido = {
          ...after,
          nome_produto: produto?.nome,
          preco_unitario: preco,
        };
      } catch (e) {
        console.error('Erro enriquecendo produto:', e);
      }
    }

    const eventoJson = {
      evento: operacao,
      tabela,
      dataEvento: ts_ms,
      before: before || null,
      after: afterEnriquecido || null,
      origem: { db: source.db, schema: source.schema, txId: source.txId },
    };

    // XADD no stream
    const id = await this.redisStream.xadd(
      streamKey,
      '*',
      'data',
      JSON.stringify(eventoJson),
    );
    console.log(`[STREAM-DEBUG] XADD ${streamKey} ID=${id}`);
  }

  private async startStreamConsumer(canal: string, group: string) {
    const streamKey = `stream:${canal}`;
    const consumer = `consumer-${process.pid}`;

    // FASE 1: histórico (ID “0”)
    await this.readGroupOnce(canal, streamKey, group, consumer, '0');

    // FASE 2: ao vivo (ID “>”)
    while (true) {
      await this.readGroupOnce(canal, streamKey, group, consumer, '>');
    }
  }

  // lê um batch do stream, dado o ID (“0” para backlog ou “>” para new)
  private async readGroupOnce(
    canal: string,
    streamKey: string,
    group: string,
    consumer: string,
    id: '0' | '>',
  ) {
    try {
      // monta dinamicamente o array de args
      const args: (string | number)[] = [
        'GROUP',
        group,
        consumer,
        'COUNT',
        100,
      ];
      if (id === '>') {
        args.push('BLOCK', 5000);
      }
      args.push('STREAMS', streamKey, id);

      const entries = await this.redisStream.xreadgroup(...args);
      if (!entries) return;

      for (const [, messages] of entries as [string, [string, string[]][]][]) {
        for (const [msgId, fields] of messages) {
          const idx = fields.indexOf('data');
          const payload = JSON.parse(fields[idx + 1]);
          // agora temos acesso ao canal
          this.wsGateway.emitirParaSala(canal, payload);
          await this.redisStream.xack(streamKey, group, msgId);
        }
      }
    } catch (err) {
      console.error(
        `Erro lendo ${id === '0' ? 'backlog' : 'stream'} em ${streamKey}:`,
        err,
      );
    }
  }
}
