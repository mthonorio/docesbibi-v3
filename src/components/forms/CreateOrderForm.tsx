"use client";

import { useState } from "react";
import { useOrderStore } from "@/store/order.store";
import type { CreateOrderInput } from "@/types/api";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Alert } from "@/components/atoms/Alert";

interface OrderItem {
  product_id: number;
  quantity: number;
}

export function CreateOrderForm() {
  const { create, loading, error } = useOrderStore();

  // Form state
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_address: "",
    notes: "",
  });

  const [items, setItems] = useState<OrderItem[]>([]);
  const [newItem, setNewItem] = useState<OrderItem>({
    product_id: 0,
    quantity: 1,
  });
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddItem = () => {
    if (newItem.product_id > 0 && newItem.quantity > 0) {
      setItems((prev) => [...prev, newItem]);
      setNewItem({ product_id: 0, quantity: 1 });
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert("Adicione pelo menos um produto ao pedido");
      return;
    }

    try {
      const orderData: CreateOrderInput = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone || undefined,
        customer_address: formData.customer_address,
        notes: formData.notes || undefined,
        items,
      };

      const order = await create(orderData);

      setSuccessMessage(`✅ Pedido criado com sucesso! ID: ${order.id}`);

      // Limpar formulário
      setFormData({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        customer_address: "",
        notes: "",
      });
      setItems([]);

      // Limpar mensagem após 5 segundos
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Erro ao criar pedido:", err);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Novo Pedido</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert variant="default" className="mb-4">
          {successMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Informações do Cliente</h3>

          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="João Silva"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="joao@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input
                type="tel"
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Endereço *</label>
            <input
              type="text"
              name="customer_address"
              value={formData.customer_address}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Rua A, 123 - São Paulo, SP"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Observações
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Deixar no portão, entregar até tal hora, etc..."
            />
          </div>
        </div>

        {/* Produtos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Produtos do Pedido</h3>

          {items.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">
                      ID Produto
                    </th>
                    <th className="px-4 py-2 text-left font-medium">
                      Quantidade
                    </th>
                    <th className="px-4 py-2 text-left font-medium">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{item.product_id}</td>
                      <td className="px-4 py-2">{item.quantity}</td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border rounded-md p-4 bg-gray-50">
            <h4 className="font-medium mb-3">Adicionar Produto</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  ID Produto *
                </label>
                <input
                  type="number"
                  min="1"
                  value={newItem.product_id}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      product_id: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Quantidade *
                </label>
                <input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleAddItem}
                  variant="outline"
                  className="w-full"
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>

          {items.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              Nenhum produto adicionado ainda
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading || items.length === 0}
          className="w-full"
        >
          {loading ? "Criando pedido..." : "Criar Pedido"}
        </Button>
      </form>
    </Card>
  );
}
