import type {
  Order,
  CreateOrderInput,
  UpdateOrderInput,
  ApiResponse,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erro na requisição");
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Erro na operação");
  }
  return data.data;
}

export const orderApi = {
  // GET - Listar todos os pedidos
  async getAll(filters?: {
    status?: string;
    email?: string;
    limit?: number;
    offset?: number;
  }): Promise<Order[]> {
    const url = new URL(`${API_BASE_URL}/api/orders`);

    if (filters?.status) {
      url.searchParams.append("status", filters.status);
    }
    if (filters?.email) {
      url.searchParams.append("email", filters.email);
    }
    if (filters?.limit) {
      url.searchParams.append("limit", filters.limit.toString());
    }
    if (filters?.offset) {
      url.searchParams.append("offset", filters.offset.toString());
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return handleResponse<Order[]>(response);
  },

  // GET - Buscar pedido específico por ID (UUID)
  async getById(id: string): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return handleResponse<Order>(response);
  },

  // POST - Criar novo pedido
  async create(order: CreateOrderInput): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });

    return handleResponse<Order>(response);
  },

  // PATCH - Atualizar pedido
  async update(id: string, updates: UpdateOrderInput): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    return handleResponse<Order>(response);
  },

  // DELETE - Deletar pedido
  async delete(id: string): Promise<{ id: string }> {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return handleResponse<{ id: string }>(response);
  },

  // Helper - Trocar status do pedido
  async updateStatus(id: string, status: string): Promise<Order> {
    return this.update(id, { status: status as any });
  },

  // Helper - Buscar pedidos por email
  async getByEmail(email: string): Promise<Order[]> {
    return this.getAll({ email });
  },

  // Helper - Buscar pedidos por status
  async getByStatus(status: string): Promise<Order[]> {
    return this.getAll({ status });
  },
};

export default orderApi;
