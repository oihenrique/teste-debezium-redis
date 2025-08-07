import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import Redis from 'ioredis';

@WebSocketGateway({ cors: { origin: '*' } })
export class KafkaGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  private redis = new Redis({
    host: process.env.REDIS_HOST || 'redis',
    port: Number(process.env.REDIS_PORT) || 6379,
  });

  afterInit() {
    console.log('WebSocket gateway pronto!');
  }

  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody() sala: string,
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(sala);
    client.emit('info', `Entrou na sala ${sala}`);

    // --- aqui vem o replay do backlog ---
    const streamKey = `stream:${sala}`;
    try {
      // Lê todo o histórico
      const entries: [string, string[]][] = await this.redis.xrange(
        streamKey,
        '-',
        '+',
      );
      for (const [, fields] of entries) {
        // fields = ['data', '{"evento":...}']
        const payload = JSON.parse(fields[1]);
        client.emit('eventoCaixa', payload);
      }
    } catch (err) {
      console.error(`Erro fazendo replay de ${streamKey}:`, err);
    }
  }

  emitirParaSala(sala: string, evento: any) {
    this.server.to(sala).emit('eventoCaixa', evento);
  }
}
