import { PartialType } from '@nestjs/mapped-types';
import { CreateCestaProdutoDto } from './create-cesta-produto.dto';

export class UpdateCestaProdutoDto extends PartialType(CreateCestaProdutoDto) {}
