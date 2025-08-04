import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CestasGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('🚀 Gateway de cestas inicializado');
  }

  emitirCestaAtualizada(cesta: any) {
    this.server.emit('cestaAtualizada', cesta);
  }
}
