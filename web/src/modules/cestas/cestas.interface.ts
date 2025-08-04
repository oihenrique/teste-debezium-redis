import { StatusCesta } from "./status-cesta.enum";

export interface Cesta {
  id: number;
  caixa_id: number;
  status: StatusCesta;
  criado_em: string; // ISO string
}
