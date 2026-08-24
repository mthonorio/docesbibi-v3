"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Upload, Loader2 } from "lucide-react";
import specialCategoryApi from "@/lib/api-clients/special-categories";
import productApi from "@/lib/api-clients/products";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/atoms/Dialog";
import type { SpecialCategorySummary, CreateSpecialCategoryInput } from "@/types/api";

const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const EMPTY_FORM: CreateSpecialCategoryInput = {
  name: "",
  slug: "",
  description: "",
  image: "",
  enabled: false,
  start_date: "",
  end_date: "",
};

export default function EventosPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<SpecialCategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateSpecialCategoryInput>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await specialCategoryApi.getAll();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar eventos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : slugify(name),
    }));
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setUploadingImage(true);
      const url = await productApi.uploadImage(file);
      setForm((prev) => ({ ...prev, image: url }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao enviar imagem");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreate = async () => {
    try {
      setSaving(true);
      setFormError(null);
      await specialCategoryApi.create(form);
      setDialogOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao criar evento");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (category: SpecialCategorySummary) => {
    if (category.enabled) {
      const confirmed = window.confirm(
        "Ao desativar este evento, os produtos vinculados deixarão de aparecer no site. Os produtos não serão excluídos.",
      );
      if (!confirmed) return;
    }
    try {
      await specialCategoryApi.update(category.id, { enabled: !category.enabled });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar evento");
    }
  };

  const handleDelete = async (category: SpecialCategorySummary) => {
    if (!window.confirm(`Excluir o evento "${category.name}" permanentemente?`)) return;
    try {
      await specialCategoryApi.delete(category.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir evento");
    }
  };

  return (
    <div>
      <div className="mb-[22px] flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[26px] text-marrom-900">Eventos Especiais</h1>
          <p className="mt-1 text-[13.5px] text-marrom-500">
            {categories.length} evento(s) cadastrado(s)
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-full bg-gradient-to-br from-rosa-800 to-rosa-700 px-[22px] py-3 text-[13.5px] font-bold text-white"
        >
          <Plus className="h-[15px] w-[15px]" strokeWidth={2.5} />
          Novo evento
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-white p-10 text-center text-marrom-500 shadow-sm">
          Carregando eventos...
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-marrom-500 shadow-sm">
          Nenhum evento cadastrado ainda.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_22px_-16px_rgba(62,39,35,0.15)]">
          <div className="flex items-center gap-4 border-b border-[#f1e4e0] px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-marrom-400">
            <span className="flex-1">Evento</span>
            <span className="w-[100px] shrink-0">Status</span>
            <span className="w-[100px] shrink-0">Início</span>
            <span className="w-[100px] shrink-0">Fim</span>
            <span className="w-[90px] shrink-0 text-right">Produtos</span>
            <span className="w-[200px] shrink-0 text-right">Ações</span>
          </div>
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-4 border-b border-[#f1e4e0] px-5 py-[15px] last:border-b-0"
            >
              <button
                onClick={() => router.push(`/admin/eventos/${category.id}`)}
                className="flex-1 truncate text-left text-[13.5px] font-bold text-marrom-900 hover:text-rosa-800"
              >
                {category.name}
              </button>
              <span className="flex w-[100px] shrink-0 items-center gap-1.5 text-[12.5px] font-semibold">
                <span
                  className={category.enabled ? "text-green-600" : "text-marrom-400"}
                >
                  {category.enabled ? "●" : "○"}
                </span>
                {category.enabled ? "Ativo" : "Inativo"}
              </span>
              <span className="w-[100px] shrink-0 text-[12px] text-marrom-500">
                {category.start_date
                  ? new Date(`${category.start_date}T00:00`).toLocaleDateString("pt-BR")
                  : "—"}
              </span>
              <span className="w-[100px] shrink-0 text-[12px] text-marrom-500">
                {category.end_date
                  ? new Date(`${category.end_date}T00:00`).toLocaleDateString("pt-BR")
                  : "—"}
              </span>
              <span className="w-[90px] shrink-0 text-right text-[13px] font-bold text-marrom-900">
                {category.product_count}
              </span>
              <div className="flex w-[200px] shrink-0 justify-end gap-1.5">
                <button
                  onClick={() => handleToggle(category)}
                  className="rounded-lg border border-[#f1e4e0] px-2.5 py-1.5 text-[11.5px] font-bold text-marrom-700 hover:bg-rosa-50"
                >
                  {category.enabled ? "Desativar" : "Ativar"}
                </button>
                <button
                  onClick={() => router.push(`/admin/eventos/${category.id}`)}
                  className="rounded-lg border border-[#f1e4e0] px-2.5 py-1.5 text-[11.5px] font-bold text-marrom-700 hover:bg-rosa-50"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(category)}
                  className="rounded-lg border border-[#f1e4e0] px-2.5 py-1.5 text-[11.5px] font-bold text-red-700 hover:bg-red-50"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo evento</DialogTitle>
          </DialogHeader>

          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div className="flex flex-col gap-3.5">
            <Field label="Nome">
              <input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Páscoa 2027"
                className="w-full rounded-xl border border-rosa-100 px-3.5 py-2.5 text-sm focus:border-rosa-800 focus:outline-none"
              />
            </Field>
            <Field label="Slug">
              <input
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm({ ...form, slug: e.target.value });
                }}
                placeholder="pascoa-2027"
                className="w-full rounded-xl border border-rosa-100 px-3.5 py-2.5 font-mono text-sm focus:border-rosa-800 focus:outline-none"
              />
            </Field>
            <Field label="Descrição (opcional)">
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full rounded-xl border border-rosa-100 px-3.5 py-2.5 text-sm focus:border-rosa-800 focus:outline-none"
              />
            </Field>
            <Field label="Imagem (opcional)">
              <label className="flex w-fit cursor-pointer items-center gap-1.5 rounded-full bg-rosa-800 px-3.5 py-2 text-xs font-bold text-white">
                {uploadingImage ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {uploadingImage ? "Enviando..." : form.image ? "Trocar imagem" : "Anexar imagem"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageSelect}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Início (opcional)">
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full rounded-xl border border-rosa-100 px-3.5 py-2.5 text-sm focus:border-rosa-800 focus:outline-none"
                />
              </Field>
              <Field label="Fim (opcional)">
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
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
              Ativar imediatamente
            </label>
          </div>

          <DialogFooter>
            <button
              onClick={handleCreate}
              disabled={saving || uploadingImage || !form.name || !form.slug}
              className="w-full rounded-full bg-gradient-to-br from-rosa-800 to-rosa-700 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? "Criando..." : "Criar evento"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
