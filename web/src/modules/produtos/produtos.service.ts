import api from "@/shared/api-client.service";

export interface Produto {
  id: number;
  nome: string;
  preco: number;
  ean: string;
}

export async function listarProdutos(): Promise<Produto[]> {
  const response = await api.get<Produto[]>("/produtos");
  return response.data;
}

export async function buscarProduto(id: number): Promise<Produto> {
  const response = await api.get<Produto>(`/produtos/${id}`);
  return response.data;
}

export async function criarProduto(
  data: Omit<Produto, "id">
): Promise<Produto> {
  const response = await api.post<Produto>("/produtos", data);
  return response.data;
}

export async function atualizarProduto(
  id: number,
  data: Partial<Produto>
): Promise<Produto> {
  const response = await api.patch<Produto>(`/produtos/${id}`, data);
  return response.data;
}

export async function deletarProduto(id: number): Promise<void> {
  await api.delete(`/produtos/${id}`);
}
