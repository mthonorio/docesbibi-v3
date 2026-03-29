import { create } from "zustand";
import type { Order, CreateOrderInput, OrderStatus } from "@/types/api";
import orderApi from "@/api/orders";

interface OrderStore {
  // Estado
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;

  // Actions - Listagem
  fetchAll: (filters?: {
    status?: string;
    email?: string;
    limit?: number;
    offset?: number;
  }) => Promise<void>;
  fetchById: (id: string) => Promise<void>;

  // Actions - Criação/Atualização
  create: (order: CreateOrderInput) => Promise<Order>;
  updateStatus: (id: string, status: OrderStatus) => Promise<void>;
  update: (id: string, data: Partial<Order>) => Promise<void>;

  // Actions - Deleção
  delete: (id: string) => Promise<void>;

  // Actions - Estado
  setCurrentOrder: (order: Order | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  // Estado inicial
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,

  // Buscar todos os pedidos
  fetchAll: async (filters) => {
    try {
      set({ loading: true, error: null });
      const orders = await orderApi.getAll(filters);
      set({ orders, loading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao buscar pedidos";
      set({ error: message, loading: false });
    }
  },

  // Buscar pedido por ID
  fetchById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const order = await orderApi.getById(id);
      set({ currentOrder: order, loading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao buscar pedido";
      set({ error: message, loading: false });
    }
  },

  // Criar novo pedido
  create: async (order: CreateOrderInput) => {
    try {
      set({ loading: true, error: null });
      const newOrder = await orderApi.create(order);
      set((state) => ({
        orders: [...state.orders, newOrder],
        loading: false,
      }));
      return newOrder;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao criar pedido";
      set({ error: message, loading: false });
      throw error;
    }
  },

  // Atualizar status do pedido
  updateStatus: async (id: string, status: OrderStatus) => {
    try {
      set({ loading: true, error: null });
      const updated = await orderApi.updateStatus(id, status);
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? updated : o)),
        currentOrder:
          state.currentOrder?.id === id ? updated : state.currentOrder,
        loading: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao atualizar pedido";
      set({ error: message, loading: false });
      throw error;
    }
  },

  // Atualizar pedido
  update: async (id: string, data: Partial<Order>) => {
    try {
      set({ loading: true, error: null });
      const updated = await orderApi.update(id, data as any);
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? updated : o)),
        currentOrder:
          state.currentOrder?.id === id ? updated : state.currentOrder,
        loading: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao atualizar pedido";
      set({ error: message, loading: false });
      throw error;
    }
  },

  // Deletar pedido
  delete: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await orderApi.delete(id);
      set((state) => ({
        orders: state.orders.filter((o) => o.id !== id),
        currentOrder: state.currentOrder?.id === id ? null : state.currentOrder,
        loading: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao deletar pedido";
      set({ error: message, loading: false });
      throw error;
    }
  },

  // Definir pedido atual
  setCurrentOrder: (order: Order | null) => {
    set({ currentOrder: order });
  },

  // Limpar erro
  clearError: () => {
    set({ error: null });
  },

  // Resetar store
  reset: () => {
    set({
      orders: [],
      currentOrder: null,
      loading: false,
      error: null,
    });
  },
}));
