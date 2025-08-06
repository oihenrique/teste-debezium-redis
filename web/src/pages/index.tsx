import { useEffect, useState } from "react";
import { io } from "socket.io-client";

interface Cesta {
  id: number;
  caixaId: number;
  status: string;
  criadoEm: string;
}

interface ProdutoCesta {
  id: number;
  cestaId: number;
  produtoId: number;
  quantidade: number;
  precoUnitario: string;
}

export default function TesteCestasPage() {
  const [cestas, setCestas] = useState<Cesta[]>([]);
  const [produtosCesta, setProdutosCesta] = useState<ProdutoCesta[]>([]);

  useEffect(() => {
    const socket = io("http://localhost:3020"); // ajuste se o backend estiver em outra porta

    socket.on("connect", () => {
      console.log("🔌 Conectado ao WebSocket");
      socket.emit("join", "R02:CX-01"); // <- sala correta!
    });

    socket.on("eventoCaixa", (evento: any) => {
      if (evento.tabela === "cesta_produtos" && evento.evento === "DELETE") {
        const before = evento.before;
        if (!before) return;
        setProdutosCesta((prev) => prev.filter((p) => p.id !== before.id));
      }
      // Adiciona/atualiza produto só em CREATE ou UPDATE
      if (evento.tabela !== "cesta_produtos") return;
      if (evento.evento !== "CREATE" && evento.evento !== "UPDATE") return;

      const after = evento.after;
      if (!after) return;

      const novoProduto: ProdutoCesta = {
        id: after.id,
        cestaId: after.cesta_id,
        produtoId: after.nome_produto,
        quantidade: after.quantidade,
        precoUnitario: after.preco_unitario,
      };

      setProdutosCesta((prev) => {
        // Atualiza se já existir, senão adiciona
        const semDuplicatas = prev.filter((p) => p.id !== novoProduto.id);
        return [...semDuplicatas, novoProduto];
      });
    });

    socket.on("eventoCaixa", (evento: any) => {
      const after = evento.after;
      if (!after) return;

      // Converta para o formato que o React espera:
      const novaCesta: Cesta = {
        id: after.id,
        caixaId: after.caixa_id,
        status: after.status,
        criadoEm: new Date(after.criado_em).toLocaleString("pt-BR"),
      };

      setCestas((prev) => {
        const atualizadas = prev.filter((c) => c.id !== novaCesta.id);
        return [...atualizadas, novaCesta];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">🧺 Cestas em tempo real</h1>
      <div className="space-y-4">
        <table className="w-full border mt-6">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Cesta</th>
              <th className="px-4 py-2">Produto</th>
              <th className="px-4 py-2">Quantidade</th>
              <th className="px-4 py-2">Preço Unitário</th>
            </tr>
          </thead>
          <tbody>
            {produtosCesta.map((produto) => (
              <tr key={produto.id}>
                <td className="px-4 py-2 text-center">{produto.id}</td>
                <td className="px-4 py-2 text-center">{produto.cestaId}</td>
                <td className="px-4 py-2 text-center">{produto.produtoId}</td>
                <td className="px-4 py-2 text-center">{produto.quantidade}</td>
                <td className="px-4 py-2 text-center">
                  {produto.precoUnitario}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
