import { StatusCesta } from './status.cesta.enum';

export class CreateCestaDto {
  caixa_id: number;
  status?: StatusCesta;
}
