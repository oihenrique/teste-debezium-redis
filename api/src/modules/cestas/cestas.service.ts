import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCestaDto } from './types/create-cesta.dto';
import { UpdateCestaDto } from './types/update-cesta.dto';
import { Cesta } from './entities/cesta.entity';
import { CestaProduto } from './entities/cesta-produto.entity';
import { UpdateCestaProdutoDto } from './types/update-cesta-produto.dto';
import { CreateCestaProdutoDto } from './types/create-cesta-produto.dto';

@Injectable()
export class CestasService {
  constructor(
    @InjectRepository(Cesta)
    private readonly cestaRepo: Repository<Cesta>,
    @InjectRepository(CestaProduto)
    private readonly cestaProdutoRepo: Repository<CestaProduto>,
  ) {}

  async criar(data: CreateCestaDto): Promise<Cesta> {
    const nova = this.cestaRepo.create(data);
    return this.cestaRepo.save(nova);
  }

  async listarTodas(): Promise<Cesta[]> {
    return this.cestaRepo.find();
  }

  async buscarPorId(id: number): Promise<Cesta> {
    const cesta = await this.cestaRepo.findOneBy({ id });
    if (!cesta) throw new NotFoundException('Cesta não encontrada');
    return cesta;
  }

  async atualizar(id: number, data: UpdateCestaDto): Promise<Cesta> {
    const cesta = await this.buscarPorId(id);
    Object.assign(cesta, data);
    return this.cestaRepo.save(cesta);
  }

  async deletar(id: number): Promise<void> {
    const cesta = await this.buscarPorId(id);
    await this.cestaRepo.remove(cesta);
  }

  // PRODUTOS CESTA
  async listarProdutosDaCesta(cesta_id: number): Promise<CestaProduto[]> {
    return this.cestaProdutoRepo.find({ where: { cesta_id } });
  }

  async adicionarProduto(
    cesta_id: number,
    data: CreateCestaProdutoDto,
  ): Promise<CestaProduto> {
    const item = this.cestaProdutoRepo.create({ ...data, cesta_id });
    return this.cestaProdutoRepo.save(item);
  }

  async atualizarProduto(
    id: number,
    data: UpdateCestaProdutoDto,
  ): Promise<CestaProduto> {
    const item = await this.cestaProdutoRepo.findOneBy({ id });
    if (!item) throw new NotFoundException('Produto da cesta não encontrado');
    Object.assign(item, data);
    return this.cestaProdutoRepo.save(item);
  }

  async removerProduto(id: number): Promise<void> {
    const item = await this.cestaProdutoRepo.findOneBy({ id });
    if (!item) throw new NotFoundException('Produto da cesta não encontrado');
    await this.cestaProdutoRepo.remove(item);
  }
}
