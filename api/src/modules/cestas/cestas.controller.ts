import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { CestasService } from './cestas.service';
import { CreateCestaDto } from './types/create-cesta.dto';
import { UpdateCestaDto } from './types/update-cesta.dto';
import { CreateCestaProdutoDto } from './types/create-cesta-produto.dto';
import { UpdateCestaProdutoDto } from './types/update-cesta-produto.dto';

@Controller('cestas')
export class CestasController {
  constructor(private readonly service: CestasService) {}

  @Post()
  criar(@Body() dto: CreateCestaDto) {
    return this.service.criar(dto);
  }

  @Get()
  listarTodas() {
    return this.service.listarTodas();
  }

  @Get(':id')
  buscar(@Param('id') id: string) {
    return this.service.buscarPorId(Number(id));
  }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() dto: UpdateCestaDto) {
    return this.service.atualizar(Number(id), dto);
  }

  @Delete(':id')
  deletar(@Param('id') id: string) {
    return this.service.deletar(Number(id));
  }

  // PRODUTOS CESTA

  @Get(':id/produtos')
  listarProdutos(@Param('id') id: string) {
    return this.service.listarProdutosDaCesta(Number(id));
  }

  @Post(':id/produtos')
  adicionarProduto(
    @Param('id') id: string,
    @Body() dto: CreateCestaProdutoDto,
  ) {
    return this.service.adicionarProduto(Number(id), dto);
  }

  @Patch('produtos/:itemId')
  atualizarProduto(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCestaProdutoDto,
  ) {
    return this.service.atualizarProduto(Number(itemId), dto);
  }

  @Delete('produtos/:itemId')
  removerProduto(@Param('itemId') itemId: string) {
    return this.service.removerProduto(Number(itemId));
  }
}
