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

@WebSocketGateway({
  cors: { origin: '*' },
})
export class KafkaGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket gateway pronto!');
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() sala: string, @ConnectedSocket() client: Socket) {
    void client.join(sala);
    client.emit('info', `Entrou na sala ${sala}`);
  }

  emitirParaSala(sala: string, evento: any) {
    this.server.to(sala).emit('eventoCaixa', evento);
  }
}
