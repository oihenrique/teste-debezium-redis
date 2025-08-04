import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './types/create-produto.dto';
import { UpdateProdutoDto } from './types/update-produto.dto';

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly service: ProdutosService) {}

  @Post()
  criar(@Body() dto: CreateProdutoDto) {
    return this.service.criar(dto);
  }

  @Get()
  listarTodos() {
    return this.service.listarTodos();
  }

  @Get(':id')
  buscar(@Param('id') id: string) {
    return this.service.buscarPorId(Number(id));
  }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() dto: UpdateProdutoDto) {
    return this.service.atualizar(Number(id), dto);
  }

  @Delete(':id')
  deletar(@Param('id') id: string) {
    return this.service.deletar(Number(id));
  }
}
