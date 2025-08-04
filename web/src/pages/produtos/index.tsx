import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { InputNumber } from "primereact/inputnumber";
import { useRef } from "react";
import {
  atualizarProduto,
  criarProduto,
  deletarProduto,
  listarProdutos,
  Produto,
} from "@/modules/produtos/produtos.service";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produto, setProduto] = useState<Partial<Produto>>({});
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState(false);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      const dados = await listarProdutos();
      setProdutos(dados);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao listar produtos",
      });
    }
  };

  const abrirNovo = () => {
    setProduto({});
    setEditando(false);
    setDialogAberto(true);
  };

  const salvar = async () => {
    try {
      if (editando && produto.id) {
        await atualizarProduto(produto.id, produto);
        toast.current?.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Produto atualizado",
        });
      } else {
        await criarProduto(produto as Produto);
        toast.current?.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Produto criado",
        });
      }
      setDialogAberto(false);
      carregarProdutos();
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao salvar produto",
      });
    }
  };

  const editar = (p: Produto) => {
    setProduto(p);
    setEditando(true);
    setDialogAberto(true);
  };

  const excluir = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    try {
      await deletarProduto(id);
      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Produto excluído",
      });
      carregarProdutos();
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao excluir",
      });
    }
  };

  return (
    <div className="p-6">
      <Toast ref={toast} />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Button label="Novo Produto" icon="pi pi-plus" onClick={abrirNovo} />
      </div>

      <DataTable value={produtos} paginator rows={10} responsiveLayout="scroll">
        <Column field="id" header="ID" sortable />
        <Column field="nome" header="Nome" sortable />
        <Column
          field="preco"
          header="Preço"
          body={(row) => {
            const preco = Number(row.preco);
            return isNaN(preco) ? "-" : `R$ ${preco.toFixed(2)}`;
          }}
          sortable
        />
        <Column field="ean" header="EAN" sortable />
        <Column
          header="Ações"
          body={(row) => (
            <div className="flex gap-2">
              <Button
                icon="pi pi-pencil"
                className="p-button-rounded p-button-warning"
                onClick={() => editar(row)}
              />
              <Button
                icon="pi pi-trash"
                className="p-button-rounded p-button-danger"
                onClick={() => excluir(row.id)}
              />
            </div>
          )}
        />
      </DataTable>

      <Dialog
        header={editando ? "Editar Produto" : "Novo Produto"}
        visible={dialogAberto}
        onHide={() => setDialogAberto(false)}
        modal
      >
        <div className="flex flex-col gap-4">
          <span className="p-float-label">
            <InputText
              id="nome"
              value={produto.nome || ""}
              onChange={(e) => setProduto({ ...produto, nome: e.target.value })}
            />
            <label htmlFor="nome">Nome</label>
          </span>

          <span className="p-float-label">
            <InputNumber
              id="preco"
              inputId="preco"
              value={produto.preco || 0}
              onValueChange={(e) =>
                setProduto({ ...produto, preco: e.value || 0 })
              }
              mode="currency"
              currency="BRL"
              locale="pt-BR"
            />
            <label htmlFor="preco"></label>
          </span>

          <span className="p-float-label">
            <InputText
              id="ean"
              value={produto.ean || ""}
              onChange={(e) => setProduto({ ...produto, ean: e.target.value })}
              placeholder="EAN"
            />
            <label htmlFor="ean"></label>
          </span>

          <div className="flex justify-end gap-2 mt-3">
            <Button
              label="Cancelar"
              className="p-button-secondary"
              onClick={() => setDialogAberto(false)}
            />
            <Button label="Salvar" onClick={salvar} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
