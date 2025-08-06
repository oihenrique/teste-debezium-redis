import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CestasController } from './cestas.controller';
import { CestasService } from './cestas.service';
import { Cesta } from './entities/cesta.entity';
import { CestaProduto } from './entities/cesta-produto.entity';
import { ProdutosService } from '../produtos/produtos.service';
import { Produto } from '../produtos/produto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cesta, CestaProduto, Produto])],
  controllers: [CestasController],
  providers: [CestasService, ProdutosService],
  exports: [CestasService, TypeOrmModule],
})
export class CestasModule {}
