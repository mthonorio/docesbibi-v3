"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import productApi from "@/lib/api-clients/products";
import { formatCurrency } from "@/functions/currency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/atoms/Dialog";
import type { Product, CreateProductInput } from "@/types/api";

const CATEGORIES = ["personalizados", "tradicionais", "gourmet", "easter"];

const EMPTY_FORM: CreateProductInput = {
  name: "",
  category: CATEGORIES[0],
  price: 0,
  image: "",
  description: "",
};

export default function ProdutosGestaoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateProductInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await productApi.getAll();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered =
    categoryFilter === "all"
      ? products
      : products.filter((p) => p.category === categoryFilter);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.image,
      description: product.description,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editingId) {
        await productApi.update(editingId, form);
      } else {
        await productApi.create(form);
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Excluir "${product.name}" permanentemente?`)) return;
    try {
      await productApi.delete(product.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir produto");
    }
  };

  return (
    <div>
      <div className="mb-[22px] flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[26px] text-marrom-900">Produtos</h1>
          <p className="mt-1 text-[13.5px] text-marrom-500">
            {products.length} produtos cadastrados
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-full bg-gradient-to-br from-rosa-800 to-rosa-700 px-[22px] py-3 text-[13.5px] font-bold text-white"
        >
          <Plus className="h-[15px] w-[15px]" strokeWidth={2.5} />
          Novo produto
        </button>
      </div>

      <div className="mb-[22px] flex gap-2">
        <FilterChip
          active={categoryFilter === "all"}
          onClick={() => setCategoryFilter("all")}
          label="Todos"
        />
        {CATEGORIES.map((c) => (
          <FilterChip
            key={c}
            active={categoryFilter === c}
            onClick={() => setCategoryFilter(c)}
            label={c.charAt(0).toUpperCase() + c.slice(1)}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-white p-10 text-center text-marrom-500 shadow-sm">
          Carregando produtos...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-marrom-500 shadow-sm">
          Nenhum produto nesta categoria.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-[18px] lg:grid-cols-4">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-[18px] bg-white shadow-[0_8px_22px_-16px_rgba(62,39,35,0.15)]"
            >
              <div className="aspect-[4/3] bg-rosa-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="mb-1.5 text-sm font-bold text-marrom-900">
                  {product.name}
                </h3>
                <span className="mb-2.5 block text-[11px] text-marrom-500">
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-bold text-vermelho-700">
                    {formatCurrency(product.price)}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEdit(product)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#f1e4e0]"
                      aria-label={`Editar ${product.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5 text-marrom-700" strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#f1e4e0]"
                      aria-label={`Excluir ${product.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-700" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar produto" : "Novo produto"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3.5">
            <Field label="Nome">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-rosa-100 px-3.5 py-2.5 text-sm focus:border-rosa-800 focus:outline-none"
              />
            </Field>
            <Field label="Categoria">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-rosa-100 px-3.5 py-2.5 text-sm focus:border-rosa-800 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Preço (R$)">
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: parseFloat(e.target.value) || 0 })
                }
                className="w-full rounded-xl border border-rosa-100 px-3.5 py-2.5 text-sm focus:border-rosa-800 focus:outline-none"
              />
            </Field>
            <Field label="URL da imagem">
              <input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-xl border border-rosa-100 px-3.5 py-2.5 text-sm focus:border-rosa-800 focus:outline-none"
              />
            </Field>
            <Field label="Descrição">
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-rosa-100 px-3.5 py-2.5 text-sm focus:border-rosa-800 focus:outline-none"
              />
            </Field>
          </div>

          <DialogFooter>
            <button
              onClick={handleSave}
              disabled={saving || !form.name || !form.image}
              className="w-full rounded-full bg-gradient-to-br from-rosa-800 to-rosa-700 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar produto"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-[12.5px] font-bold ${
        active ? "bg-rosa-800 text-white" : "border border-[#f1e4e0] bg-white text-marrom-700"
      }`}
    >
      {label}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-marrom-900">{label}</label>
      {children}
    </div>
  );
}
