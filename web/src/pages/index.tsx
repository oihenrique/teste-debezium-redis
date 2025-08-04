import { useEffect, useState } from "react";
import { io } from "socket.io-client";

interface Cesta {
  id: number;
  caixaId: number;
  status: string;
  criadoEm: string;
}

export default function TesteCestasPage() {
  const [cestas, setCestas] = useState<Cesta[]>([]);

  useEffect(() => {
    const socket = io("http://localhost:3020"); // ajuste se o backend estiver em outra porta

    socket.on("connect", () => {
      console.log("🔌 Conectado ao WebSocket");
    });

    socket.on("cestaAtualizada", (novaCesta: Cesta) => {
      console.log("📦 Cesta recebida:", novaCesta);

      setCestas((prev) => {
        // remove duplicatas pelo ID
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
        {cestas.map((cesta) => (
          <div
            key={cesta.id}
            className="border rounded p-4 bg-white shadow-sm space-y-1"
          >
            <p>
              <strong>ID:</strong> {cesta.id}
            </p>
            <p>
              <strong>Caixa:</strong> {cesta.caixaId}
            </p>
            <p>
              <strong>Status:</strong> {cesta.status}
            </p>
            <p>
              <strong>Criado em:</strong> {cesta.criadoEm}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
