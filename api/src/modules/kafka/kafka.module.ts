import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { KafkaGateway } from './kafka.gateway';

@Module({
  providers: [KafkaGateway, KafkaService],
})
export class KafkaModule {}
