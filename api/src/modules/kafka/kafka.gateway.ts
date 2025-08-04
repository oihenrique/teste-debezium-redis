import { WebSocketGateway } from '@nestjs/websockets';
import { KafkaService } from './kafka.service';

@WebSocketGateway()
export class KafkaGateway {
  constructor(private readonly kafkaService: KafkaService) {}
}
