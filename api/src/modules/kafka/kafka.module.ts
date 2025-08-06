import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { KafkaGateway } from './kafka.gateway';
import { DebeziumListenerService } from './debezium-listener.service';

@Module({
  providers: [KafkaGateway, KafkaService],
  controllers: [DebeziumListenerService],
})
export class KafkaModule {}
