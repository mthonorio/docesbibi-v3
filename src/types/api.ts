export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductInput {
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
}

export interface UpdateProductInput {
  name?: string;
  category?: string;
  price?: number;
  image?: string;
  description?: string;
}

// ========== ORDERS ==========
export type OrderStatus =
  | "pendente"
  | "confirmado"
  | "enviado"
  | "entregue"
  | "cancelado";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
  created_at?: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address: string;
  total_price: number;
  status: OrderStatus;
  notes?: string;
  items?: OrderItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateOrderInput {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address: string;
  notes?: string;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

export interface UpdateOrderInput {
  status?: OrderStatus;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ========== EASTER EGGS ==========
export type EasterModelType = "150g" | "duo_150g" | "trio_50g" | "400g";

export interface EasterModel {
  type: EasterModelType;
  label: string;
  price: number;
  flavorCount: number; // 1 para 150g, 2 para duo, 3 para trio, 1 para 400g
  description: string;
  image: string;
}

export interface EasterFlavor {
  id: number;
  name: string;
  description: string;
  color_hex: string;
}

export interface CustomEasterEgg {
  model: EasterModelType;
  flavors: string[]; // Array de nomes dos sabores
  price: number;
  quantity: number;
}

export interface OrderItemEaster extends OrderItem {
  flavors?: string[]; // Array de sabores customizados
  model_type?: EasterModelType;
}
