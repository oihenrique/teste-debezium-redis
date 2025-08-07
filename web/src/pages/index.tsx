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
    const socket = io("http://localhost:3020");

    socket.on("connect", () => {
      console.log("🔌 Conectado ao WebSocket");
      socket.emit("join", "R02:CX-01");
    });

    socket.on("eventoCaixa", (evento: any) => {
      // 1) Produtos na cesta
      if (evento.tabela === "cesta_produtos") {
        if (evento.evento === "DELETE" && evento.before) {
          setProdutosCesta((prev) =>
            prev.filter((p) => p.id !== evento.before.id)
          );
        } else if (evento.evento === "CREATE" || evento.evento === "UPDATE") {
          const after = evento.after!;
          const novo: ProdutoCesta = {
            id: after.id,
            cestaId: after.cesta_id,
            produtoId: after.nome_produto,
            quantidade: after.quantidade,
            precoUnitario: after.preco_unitario,
          };
          setProdutosCesta((prev) => {
            const sem = prev.filter((p) => p.id !== novo.id);
            return [...sem, novo];
          });
        }
        return; // não processa mais abaixo
      }

      // 2) Cestas
      if (evento.tabela === "cestas") {
        const after = evento.after!;
        const nova: Cesta = {
          id: after.id,
          caixaId: after.caixa_id,
          status: after.status,
          criadoEm: new Date(after.criado_em).toLocaleString("pt-BR"),
        };
        setCestas((prev) => {
          const sem = prev.filter((c) => c.id !== nova.id);
          return [...sem, nova];
        });
      }
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
