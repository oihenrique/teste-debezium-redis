import api from "@/shared/api-client.service";
import { Cesta } from "./cestas.interface";
import { CestaProduto } from "./cesta-produto.interface";

// Listar todas as cestas
export async function listarCestas(): Promise<Cesta[]> {
  const res = await api.get<Cesta[]>("/cestas");
  return res.data;
}

// Buscar uma cesta por ID
export async function buscarCesta(id: number): Promise<Cesta> {
  const res = await api.get<Cesta>(`/cestas/${id}`);
  return res.data;
}

// Criar uma nova cesta
export async function criarCesta(
  data: Omit<Cesta, "id" | "criado_em">
): Promise<Cesta> {
  const res = await api.post<Cesta>("/cestas", data);
  return res.data;
}

// Atualizar uma cesta existente
export async function atualizarCesta(
  id: number,
  data: Partial<Cesta>
): Promise<Cesta> {
  const res = await api.patch<Cesta>(`/cestas/${id}`, data);
  return res.data;
}

// Deletar uma cesta
export async function deletarCesta(id: number): Promise<void> {
  await api.delete(`/cestas/${id}`);
}

// Listar produtos de uma cesta
export async function listarProdutosDaCesta(
  cestaId: number
): Promise<CestaProduto[]> {
  const res = await api.get<CestaProduto[]>(`/cestas/${cestaId}/produtos`);
  return res.data;
}

// Adicionar produto à cesta
export async function adicionarProdutoNaCesta(
  cestaId: number,
  data: Omit<CestaProduto, "id" | "cesta_id">
): Promise<CestaProduto> {
  const res = await api.post<CestaProduto>(`/cestas/${cestaId}/produtos`, data);
  return res.data;
}

// Atualizar produto da cesta
export async function atualizarProdutoDaCesta(
  itemId: number,
  data: Partial<Omit<CestaProduto, "id" | "cesta_id">>
): Promise<CestaProduto> {
  const res = await api.patch<CestaProduto>(`/cestas/produtos/${itemId}`, data);
  return res.data;
}

// Remover produto da cesta
export async function removerProdutoDaCesta(itemId: number): Promise<void> {
  await api.delete(`/cestas/produtos/${itemId}`);
}
