import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CestasController } from './cestas.controller';
import { CestasService } from './cestas.service';
import { Cesta } from './entities/cesta.entity';
import { CestaProduto } from './entities/cesta-produto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cesta, CestaProduto])],
  controllers: [CestasController],
  providers: [CestasService],
})
export class CestasModule {}
