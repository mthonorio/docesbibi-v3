import {
  SpecialCategory,
  SpecialCategorySummary,
  CreateSpecialCategoryInput,
  UpdateSpecialCategoryInput,
  Product,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    let errorMessage = "Erro na requisição";

    if (contentType?.includes("application/json")) {
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch {
        errorMessage = `Erro HTTP ${response.status}`;
      }
    } else {
      errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
    }

    throw new Error(errorMessage);
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Erro na operação");
  }
  return data.data;
}

export const specialCategoryApi = {
  // GET - Listar eventos com contagem de produtos
  async getAll(): Promise<SpecialCategorySummary[]> {
    const response = await fetch(`${API_BASE_URL}/api/special-categories`, {
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse<SpecialCategorySummary[]>(response);
  },

  // GET - Evento + produtos vinculados
  async getById(id: string): Promise<{ category: SpecialCategory; products: Product[] }> {
    const response = await fetch(`${API_BASE_URL}/api/special-categories/${id}`, {
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse<{ category: SpecialCategory; products: Product[] }>(response);
  },

  // POST - Criar evento
  async create(input: CreateSpecialCategoryInput): Promise<SpecialCategorySummary> {
    const response = await fetch(`${API_BASE_URL}/api/special-categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handleResponse<SpecialCategorySummary>(response);
  },

  // PATCH - Atualizar evento (inclui o toggle de `enabled`)
  async update(id: string, updates: UpdateSpecialCategoryInput): Promise<SpecialCategory> {
    const response = await fetch(`${API_BASE_URL}/api/special-categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return handleResponse<SpecialCategory>(response);
  },

  // DELETE - Excluir evento (bloqueado pela API se houver produtos vinculados)
  async delete(id: string): Promise<{ id: string }> {
    const response = await fetch(`${API_BASE_URL}/api/special-categories/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse<{ id: string }>(response);
  },

  // POST - Vincular produtos em lote
  async addProducts(id: string, productIds: string[]): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/api/special-categories/${id}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_ids: productIds }),
    });
    return handleResponse<Product[]>(response);
  },

  // DELETE - Remover um produto do evento (não apaga o produto)
  async removeProduct(id: string, productId: string): Promise<{ id: string }> {
    const response = await fetch(
      `${API_BASE_URL}/api/special-categories/${id}/products/${productId}`,
      { method: "DELETE", headers: { "Content-Type": "application/json" } },
    );
    return handleResponse<{ id: string }>(response);
  },
};

export default specialCategoryApi;
