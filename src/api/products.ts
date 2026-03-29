import { Product, CreateProductInput, UpdateProductInput } from "@/types/api";

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

export const productApi = {
  // GET - Listar todos os produtos
  async getAll(category?: string): Promise<Product[]> {
    const url = new URL(`${API_BASE_URL}/api/products`);
    if (category && category !== "all") {
      url.searchParams.append("category", category);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return handleResponse<Product[]>(response);
  },

  // GET - Buscar um produto específico
  async getById(id: number): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Erro ao buscar produto");
    }
    return data.data;
  },

  // POST - Criar novo produto
  async create(product: CreateProductInput): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });

    return handleResponse<Product>(response);
  },

  // PATCH - Atualizar produto
  async update(id: number, updates: UpdateProductInput): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    return handleResponse<Product>(response);
  },

  // DELETE - Deletar produto
  async delete(id: number): Promise<{ id: number }> {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return handleResponse<{ id: number }>(response);
  },
};

export default productApi;
