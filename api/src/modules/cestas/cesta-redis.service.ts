import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { CestasGateway } from './cestas.gateway';

@Injectable()
export class CestaRedisService implements OnModuleInit {
  private subscriber: Redis;

  constructor(private readonly gateway: CestasGateway) {
    this.subscriber = new Redis({
      host: process.env.REDIS_HOST ?? 'redis',
      port: Number(process.env.REDIS_PORT ?? '6379'),
    });
  }

  async onModuleInit() {
    await this.subscriber.subscribe('cestas');
    console.log('📡 Inscrito no canal Redis: cestas');

    this.subscriber.on('message', (channel, message) => {
      const dados = JSON.parse(message);
      console.log('📤 Recebido do Redis:', dados);

      // envia para o frontend
      this.gateway.emitirCestaAtualizada(dados);
    });
  }
}
