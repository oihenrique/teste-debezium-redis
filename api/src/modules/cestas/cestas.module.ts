import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CestasController } from './cestas.controller';
import { CestasService } from './cestas.service';
import { Cesta } from './entities/cesta.entity';
import { CestaProduto } from './entities/cesta-produto.entity';
import { CestasGateway } from './cestas.gateway';
import { CestaRedisService } from './cesta-redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cesta, CestaProduto])],
  controllers: [CestasController],
  providers: [CestasService, CestasGateway, CestaRedisService],
})
export class CestasModule {}
