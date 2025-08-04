import { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Cesta } from "@/modules/cestas/cestas.interface";
import {
  adicionarProdutoNaCesta,
  atualizarCesta,
  criarCesta,
  deletarCesta,
  listarCestas,
  listarProdutosDaCesta,
  removerProdutoDaCesta,
} from "@/modules/cestas/cestas.service";
import { StatusCesta } from "@/modules/cestas/status-cesta.enum";
import { CestaProduto } from "@/modules/cestas/cesta-produto.interface";
import { listarProdutos } from "@/modules/produtos/produtos.service";

export default function CestasPage() {
  const [cestas, setCestas] = useState<Cesta[]>([]);
  const [cesta, setCesta] = useState<Partial<Cesta>>({});
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [produtosCesta, setProdutosCesta] = useState<CestaProduto[]>([]);
  const [cestaSelecionada, setCestaSelecionada] = useState<Cesta | null>(null);
  const [dialogProdutosAberto, setDialogProdutosAberto] = useState(false);
  const [novoProduto, setNovoProduto] = useState<Partial<CestaProduto>>({});
  const [produtos, setProdutos] = useState<
    { id: number; nome: string; preco: number }[]
  >([]);

  const toast = useRef<Toast>(null);

  useEffect(() => {
    carregarCestas();
  }, []);

  const carregarCestas = async () => {
    try {
      const dados = await listarCestas();
      setCestas(dados);
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao carregar cestas",
      });
    }
  };

  const abrirNovo = () => {
    setCesta({ status: StatusCesta.ABERTA });
    setEditando(false);
    setDialogAberto(true);
  };

  const salvar = async () => {
    try {
      if (editando && cesta.id) {
        await atualizarCesta(cesta.id, cesta);
        toast.current?.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Cesta atualizada",
        });
      } else {
        await criarCesta(cesta as Omit<Cesta, "id" | "criado_em">);
        toast.current?.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Cesta criada",
        });
      }
      setDialogAberto(false);
      carregarCestas();
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao salvar cesta",
      });
    }
  };

  const editar = (c: Cesta) => {
    setCesta(c);
    setEditando(true);
    setDialogAberto(true);
  };

  const excluir = async (id: number) => {
    if (!confirm("Deseja excluir esta cesta?")) return;
    try {
      await deletarCesta(id);
      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Cesta excluída",
      });
      carregarCestas();
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao excluir cesta",
      });
    }
  };

  const abrirProdutosDaCesta = async (cesta: Cesta) => {
    setCestaSelecionada(cesta);
    try {
      const [itens, todosProdutos] = await Promise.all([
        listarProdutosDaCesta(cesta.id),
        listarProdutos(),
      ]);

      setProdutosCesta(itens);
      setProdutos(todosProdutos);
      setDialogProdutosAberto(true);
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao carregar produtos da cesta",
      });
    }
  };

  const adicionarProduto = async () => {
    if (
      !cestaSelecionada ||
      !novoProduto.produto_id ||
      !novoProduto.quantidade ||
      !novoProduto.preco_unitario
    ) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Preencha todos os campos",
      });
      return;
    }

    try {
      await adicionarProdutoNaCesta(cestaSelecionada.id, {
        produto_id: novoProduto.produto_id,
        preco_unitario: novoProduto.preco_unitario,
        quantidade: novoProduto.quantidade,
      });

      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Produto adicionado",
      });

      const atualizados = await listarProdutosDaCesta(cestaSelecionada.id);
      setProdutosCesta(atualizados);
      setNovoProduto({});
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao adicionar produto",
      });
    }
  };

  const removerProduto = async (itemId: number) => {
    try {
      await removerProdutoDaCesta(itemId);
      toast.current?.show({
        severity: "success",
        summary: "Removido",
        detail: "Produto removido da cesta",
      });

      if (cestaSelecionada) {
        const atualizados = await listarProdutosDaCesta(cestaSelecionada.id);
        setProdutosCesta(atualizados);
      }
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao remover produto",
      });
    }
  };

  const statusOptions = Object.values(StatusCesta).map((s) => ({
    label: s.charAt(0).toUpperCase() + s.slice(1),
    value: s,
  }));

  return (
    <div className="p-6">
      <Toast ref={toast} />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Cestas</h1>
        <div className="flex gap-4">
          <Button label="Nova Cesta" icon="pi pi-plus" onClick={abrirNovo} />
          <Button
            label="Gerenciar Produtos"
            icon="pi pi-box"
            onClick={() => {
              if (!cestaSelecionada) {
                toast.current?.show({
                  severity: "warn",
                  summary: "Aviso",
                  detail: "Selecione uma cesta na tabela",
                });
                return;
              }
              abrirProdutosDaCesta(cestaSelecionada);
            }}
          />
        </div>
      </div>

      <DataTable
        value={cestas}
        paginator
        rows={10}
        responsiveLayout="scroll"
        selection={cestaSelecionada}
        onSelectionChange={(e) => setCestaSelecionada(e.value as Cesta | null)}
        selectionMode="single"
      >
        <Column field="id" header="ID" sortable />
        <Column field="caixa_id" header="Caixa" sortable />
        <Column field="status" header="Status" sortable />
        <Column
          field="criado_em"
          header="Criado em"
          body={(row) => new Date(row.criado_em).toLocaleString("pt-BR")}
          sortable
        />
        <Column
          header="Ações"
          body={(row) => (
            <div className="flex gap-2">
              <Button
                icon="pi pi-pencil"
                className="p-button-warning p-button-rounded"
                onClick={() => editar(row)}
              />
              <Button
                icon="pi pi-trash"
                className="p-button-danger p-button-rounded"
                onClick={() => excluir(row.id)}
              />
            </div>
          )}
        />
      </DataTable>

      <Dialog
        header={editando ? "Editar Cesta" : "Nova Cesta"}
        visible={dialogAberto}
        onHide={() => setDialogAberto(false)}
        modal
      >
        <div className="flex flex-col gap-4">
          <span className="p-float-label">
            <InputNumber
              id="caixa_id"
              value={cesta.caixa_id || 0}
              onValueChange={(e) =>
                setCesta({ ...cesta, caixa_id: e.value || 0 })
              }
            />
            <label htmlFor="caixa_id">ID do Caixa</label>
          </span>

          <span className="p-float-label">
            <Dropdown
              id="status"
              value={cesta.status}
              options={statusOptions}
              onChange={(e) => setCesta({ ...cesta, status: e.value })}
              placeholder="Selecione o status"
            />
            <label htmlFor="status">Status</label>
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

      <Dialog
        header={`Produtos da Cesta #${cestaSelecionada?.id}`}
        visible={dialogProdutosAberto}
        onHide={() => setDialogProdutosAberto(false)}
        modal
        style={{ width: "50vw" }}
      >
        <div className="flex flex-col gap-3 mb-4">
          <span className="p-float-label">
            <Dropdown
              value={novoProduto.produto_id}
              options={produtos.map((p) => ({ label: p.nome, value: p.id }))}
              onChange={(e) => {
                const produtoSelecionado = produtos.find(
                  (p) => p.id === e.value
                );
                setNovoProduto({
                  ...novoProduto,
                  produto_id: e.value,
                  preco_unitario: produtoSelecionado?.preco || 0,
                });
              }}
              placeholder="Selecione um produto"
            />
            <label htmlFor="produto_id">Produto</label>
          </span>

          <span className="p-float-label">
            <InputNumber
              inputId="quantidade"
              value={novoProduto.quantidade || 1}
              onValueChange={(e) =>
                setNovoProduto({ ...novoProduto, quantidade: e.value || 1 })
              }
            />
            <label htmlFor="quantidade">Quantidade</label>
          </span>

          <span className="p-float-label">
            <InputNumber
              inputId="preco_unitario"
              value={novoProduto.preco_unitario || 0}
              mode="currency"
              currency="BRL"
              locale="pt-BR"
              disabled
            />
            <label htmlFor="preco_unitario">Preço Unitário</label>
          </span>

          <Button
            label="Adicionar Produto"
            icon="pi pi-plus"
            onClick={adicionarProduto}
          />
        </div>

        <DataTable value={produtosCesta} responsiveLayout="scroll">
          <Column field="id" header="ID" />
          <Column field="produto_id" header="Produto" />
          <Column field="quantidade" header="Qtd" />
          <Column
            field="preco_unitario"
            header="Preço Unitário"
            body={(row) => `R$ ${Number(row.preco_unitario).toFixed(2)}`}
          />
          <Column
            header="Ações"
            body={(row) => (
              <Button
                icon="pi pi-trash"
                className="p-button-danger p-button-rounded"
                onClick={() => removerProduto(row.id)}
              />
            )}
          />
        </DataTable>
      </Dialog>
    </div>
  );
}
