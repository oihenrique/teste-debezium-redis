import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from './produto.entity';
import { CreateProdutoDto } from './types/create-produto.dto';
import { UpdateProdutoDto } from './types/update-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(
    @InjectRepository(Produto)
    private readonly produtoRepo: Repository<Produto>,
  ) {}

  async criar(data: CreateProdutoDto): Promise<Produto> {
    const novo = this.produtoRepo.create(data);
    return this.produtoRepo.save(novo);
  }

  async listarTodos(): Promise<Produto[]> {
    return this.produtoRepo.find();
  }

  async buscarPorId(id: number): Promise<Produto> {
    const produto = await this.produtoRepo.findOneBy({ id });
    if (!produto) throw new NotFoundException('Produto não encontrado');
    return produto;
  }

  async atualizar(id: number, data: UpdateProdutoDto): Promise<Produto> {
    const produto = await this.buscarPorId(id);
    Object.assign(produto, data);
    return this.produtoRepo.save(produto);
  }

  async deletar(id: number): Promise<void> {
    const produto = await this.buscarPorId(id);
    await this.produtoRepo.remove(produto);
  }
}
