import { Controller, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import Redis from 'ioredis';
import { KafkaGateway } from './kafka.gateway';

@Controller()
export class DebeziumListenerService implements OnModuleInit, OnModuleDestroy {
  private redisPub: Redis;
  private redisSub: Redis;

  constructor(private wsGateway: KafkaGateway) {}

  onModuleInit() {
    this.redisPub = new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: Number(process.env.REDIS_PORT) || 6379,
    });

    this.redisSub = new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: Number(process.env.REDIS_PORT) || 6379,
    });

    this.redisSub.psubscribe('R*:CX-*', (err, count) => {
      if (err) console.error('Erro ao subscrever Redis:', err);
      else console.log('Subscrito nos canais de caixas');
    });

    this.redisSub.on('pmessage', (pattern, channel, message) => {
      const evento = JSON.parse(message);
      this.wsGateway.emitirParaSala(channel, evento);
      console.log(`Repassado do Redis para sala ${channel} via socket!`);
    });
  }

  async onModuleDestroy() {
    if (this.redisPub) await this.redisPub.quit();
    if (this.redisSub) await this.redisSub.quit();
  }

  @EventPattern('dbserver1.public.cestas')
  async handleDebeziumEvent(@Payload() data: any) {
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

    const eventoJson = {
      evento: operacao,
      tabela: source?.table || null,
      dataEvento: ts_ms,
      before: before || null,
      after: after || null,
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
