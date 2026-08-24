"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Upload, Loader2, Search } from "lucide-react";
import specialCategoryApi from "@/lib/api-clients/special-categories";
import productApi from "@/lib/api-clients/products";
import { formatCurrency } from "@/functions/currency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/atoms/Dialog";
import type { SpecialCategory, Product, UpdateSpecialCategoryInput } from "@/types/api";

export default function EventoDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [category, setCategory] = useState<SpecialCategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<UpdateSpecialCategoryInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [candidates, setCandidates] = useState<Product[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = async () => {
    try {
      setLoading(true);
      const data = await specialCategoryApi.getById(params.id);
      setCategory(data.category);
      setProducts(data.products);
      setForm({
        name: data.category.name,
        slug: data.category.slug,
        description: data.category.description || "",
        image: data.category.image || "",
        enabled: data.category.enabled,
        start_date: data.category.start_date,
        end_date: data.category.end_date,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar evento");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !form) return;
    try {
      setUploadingImage(true);
      const url = await productApi.uploadImage(file);
      setForm({ ...form, image: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar imagem");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!category || !form) return;

    if (category.enabled && form.enabled === false) {
      const confirmed = window.confirm(
        "Ao desativar este evento, os produtos vinculados deixarão de aparecer no site. Os produtos não serão excluídos.",
      );
      if (!confirmed) return;
    }

    try {
      setSaving(true);
      await specialCategoryApi.update(category.id, form);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar evento");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    if (!category) return;
    try {
      await specialCategoryApi.removeProduct(category.id, productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover produto");
    }
  };

  const openAddDialog = async () => {
    setAddOpen(true);
    setSearch("");
    setSelected(new Set());
    try {
      setCandidatesLoading(true);
      const all = await productApi.getAll(undefined, { includeInactive: true });
      setCandidates(all.filter((p) => p.special_category_id !== category?.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar produtos");
    } finally {
      setCandidatesLoading(false);
    }
  };

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddProducts = async () => {
    if (!category || selected.size === 0) return;
    try {
      await specialCategoryApi.addProducts(category.id, Array.from(selected));
      setAddOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao vincular produtos");
    }
  };

  const filteredCandidates = candidates.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return <div className="p-10 text-center text-marrom-500">Carregando evento...</div>;
  }

  if (error && !category) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center text-marrom-500 shadow-sm">
        {error}
      </div>
    );
  }

  if (!category || !form) return null;

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/eventos")}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f1e4e0] bg-white"
        >
          <ChevronLeft className="h-[15px] w-[15px] text-marrom-900" strokeWidth={2.2} />
        </button>
        <h1 className="font-serif text-2xl text-marrom-900">{category.name}</h1>
      </div>
      <p className="mb-6 ml-[44px] text-[13px] text-marrom-500">
        {products.length} produto(s) vinculado(s)
      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-[1fr_1.3fr]">
        <Section title="Dados do evento">
          <div className="flex flex-col gap-3.5">
            <Field label="Nome">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-rosa-100 px-3.5 py-2.5 text-sm focus:border-rosa-800 focus:outline-none"
              />
            </Field>
            <Field label="Slug">
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full rounded-xl border border-rosa-100 px-3.5 py-2.5 font-mono text-sm focus:border-rosa-800 focus:outline-none"
              />
            </Field>
            <Field label="Descrição">
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full rounded-xl border border-rosa-100 px-3.5 py-2.5 text-sm focus:border-rosa-800 focus:outline-none"
              />
            </Field>
            <Field label="Imagem">
              <div className="flex items-center gap-3">
                {form.image && (
                  <img
                    src={form.image}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                )}
                <label className="flex w-fit cursor-pointer items-center gap-1.5 rounded-full bg-rosa-800 px-3.5 py-2 text-xs font-bold text-white">
                  {uploadingImage ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  {uploadingImage ? "Enviando..." : "Trocar imagem"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageSelect}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Início">
                <input
                  type="date"
                  value={form.start_date || ""}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value || null })}
                  className="w-full rounded-xl border border-rosa-100 px-3.5 py-2.5 text-sm focus:border-rosa-800 focus:outline-none"
                />
              </Field>
              <Field label="Fim">
                <input
                  type="date"
                  value={form.end_date || ""}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value || null })}
                  className="w-full rounded-xl border border-rosa-100 px-3.5 py-2.5 text-sm focus:border-rosa-800 focus:outline-none"
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm font-bold text-marrom-900">
              <input
                type="checkbox"
                checked={form.enabled ?? false}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                className="h-4 w-4 accent-rosa-800"
              />
              Evento ativo (produtos aparecem no site)
            </label>

            <button
              onClick={handleSave}
              disabled={saving || uploadingImage || !form.name || !form.slug}
              className="mt-2 w-full rounded-full bg-gradient-to-br from-rosa-800 to-rosa-700 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </Section>

        <Section title="Produtos do evento">
          <button
            onClick={openAddDialog}
            className="mb-3.5 flex items-center gap-1.5 rounded-full bg-gradient-to-br from-rosa-800 to-rosa-700 px-4 py-2 text-[12.5px] font-bold text-white"
          >
            + Adicionar produtos
          </button>

          {products.length === 0 ? (
            <p className="py-4 text-center text-[12.5px] text-marrom-400">
              Nenhum produto vinculado a este evento ainda.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-xl border border-[#f1e4e0] px-3.5 py-2.5"
                >
                  <img
                    src={product.image}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-marrom-900">
                      {product.name}
                    </p>
                    <p className="text-[11.5px] text-marrom-500">
                      {formatCurrency(product.price)}
                      {!product.active && " · Inativo"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveProduct(product.id)}
                    className="rounded-lg border border-[#f1e4e0] px-2.5 py-1.5 text-[11.5px] font-bold text-red-700 hover:bg-red-50"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar produtos</DialogTitle>
          </DialogHeader>

          <div className="mb-3 flex items-center gap-2 rounded-full border border-rosa-100 bg-rosa-50 px-4 py-2.5">
            <Search className="h-3.5 w-3.5 text-marrom-500" strokeWidth={2} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto..."
              className="w-full bg-transparent text-[13px] text-marrom-900 placeholder:text-marrom-400 focus:outline-none"
            />
          </div>

          <div className="max-h-80 overflow-y-auto">
            {candidatesLoading ? (
              <p className="py-6 text-center text-[12.5px] text-marrom-500">Carregando...</p>
            ) : filteredCandidates.length === 0 ? (
              <p className="py-6 text-center text-[12.5px] text-marrom-500">
                Nenhum produto disponível.
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {filteredCandidates.map((product) => (
                  <label
                    key={product.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 hover:bg-rosa-50"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(product.id)}
                      onChange={() => toggleSelected(product.id)}
                      className="h-4 w-4 accent-rosa-800"
                    />
                    <img
                      src={product.image}
                      alt=""
                      className="h-8 w-8 shrink-0 rounded-lg object-cover"
                    />
                    <span className="min-w-0 flex-1 truncate text-[13px] text-marrom-900">
                      {product.name}
                    </span>
                    {product.special_category_id && (
                      <span className="shrink-0 text-[10.5px] text-marrom-400">
                        já em outro evento
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <button
              onClick={handleAddProducts}
              disabled={selected.size === 0}
              className="w-full rounded-full bg-gradient-to-br from-rosa-800 to-rosa-700 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              Adicionar {selected.size > 0 ? `(${selected.size})` : ""}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] bg-white p-[22px] shadow-[0_8px_22px_-16px_rgba(62,39,35,0.15)]">
      <span className="mb-3.5 block text-[11px] font-bold uppercase tracking-wide text-marrom-500">
        {title}
      </span>
      {children}
    </div>
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
