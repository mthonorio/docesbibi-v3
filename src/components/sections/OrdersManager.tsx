"use client";

import { useEffect, useState } from "react";
import { useOrderStore } from "@/store/order.store";
import type { Order, OrderStatus } from "@/types/api";
import { Card } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { Alert } from "@/components/atoms/Alert";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pendente: "bg-yellow-100 text-yellow-800",
  confirmado: "bg-blue-100 text-blue-800",
  enviado: "bg-purple-100 text-purple-800",
  entregue: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export function OrdersManager() {
  const {
    orders,
    loading,
    error,
    fetchAll,
    updateStatus,
    delete: deleteOrder,
  } = useOrderStore();

  const [filter, setFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredOrders = filter
    ? orders.filter(
        (o) =>
          o.status === filter ||
          o.customer_email.toLowerCase().includes(filter.toLowerCase()) ||
          o.customer_name.toLowerCase().includes(filter.toLowerCase()),
      )
    : orders;

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    try {
      await updateStatus(order.id, newStatus);
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  const handleDelete = async (order: Order) => {
    if (
      confirm(
        `Tem certeza que deseja deletar o pedido ${order.id.slice(0, 8)}?`,
      )
    ) {
      try {
        await deleteOrder(order.id);
      } catch (err) {
        console.error("Erro ao deletar pedido:", err);
      }
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Meus Pedidos</h1>
        <span className="text-lg text-gray-600">
          {filteredOrders.length} pedidos
        </span>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter("")}
          className={`px-4 py-2 rounded-md font-medium ${
            filter === ""
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Todos
        </button>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-md font-medium ${
              filter === key
                ? `${STATUS_COLORS[key as OrderStatus]}`
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Erros */}
      {error && <Alert variant="destructive">{error}</Alert>}

      {/* Lista de Pedidos */}
      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Carregando pedidos...</p>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Nenhum pedido encontrado</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewDetails(order)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-gray-600">
                      {order.id.slice(0, 8)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        STATUS_COLORS[order.status]
                      }`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg">
                    {order.customer_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {order.customer_email}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.customer_address}
                  </p>
                  <div className="mt-2 text-sm text-gray-500">
                    {order.items?.length || 0} item(s) • Total:{" "}
                    <span className="font-semibold">
                      R$ {(order.total_price || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-col gap-2 ml-4">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order, e.target.value as OrderStatus)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(order);
                    }}
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Detalhes */}
      {showDetails && selectedOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetails(false)}
        >
          <Card
            className="w-full max-w-2xl max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Detalhes do Pedido</h2>
                  <p className="text-sm text-gray-600 font-mono">
                    {selectedOrder.id}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    STATUS_COLORS[selectedOrder.status]
                  }`}
                >
                  {STATUS_LABELS[selectedOrder.status]}
                </span>
              </div>

              <div className="space-y-4">
                {/* Cliente */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Informações do Cliente</h3>
                  <p>
                    <strong>Nome:</strong> {selectedOrder.customer_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedOrder.customer_email}
                  </p>
                  {selectedOrder.customer_phone && (
                    <p>
                      <strong>Telefone:</strong> {selectedOrder.customer_phone}
                    </p>
                  )}
                  <p>
                    <strong>Endereço:</strong> {selectedOrder.customer_address}
                  </p>
                </div>

                {/* Itens */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Produtos</h3>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-2 py-1 text-left">Produto</th>
                        <th className="px-2 py-1 text-right">Qtd</th>
                        <th className="px-2 py-1 text-right">Preço</th>
                        <th className="px-2 py-1 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="px-2 py-1">{item.product_name}</td>
                          <td className="px-2 py-1 text-right">
                            {item.quantity}
                          </td>
                          <td className="px-2 py-1 text-right">
                            R$ {item.price.toFixed(2)}
                          </td>
                          <td className="px-2 py-1 text-right font-semibold">
                            R$ {item.subtotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <p className="text-lg font-semibold">
                    Total: R$ {(selectedOrder.total_price || 0).toFixed(2)}
                  </p>
                </div>

                {/* Notas */}
                {selectedOrder.notes && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Observações</h3>
                    <p className="text-sm bg-gray-50 p-2 rounded">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="border-t pt-4 text-xs text-gray-500 space-y-1">
                  {selectedOrder.created_at && (
                    <p>
                      Criado:{" "}
                      {new Date(selectedOrder.created_at).toLocaleString(
                        "pt-BR",
                      )}
                    </p>
                  )}
                  {selectedOrder.updated_at && (
                    <p>
                      Atualizado:{" "}
                      {new Date(selectedOrder.updated_at).toLocaleString(
                        "pt-BR",
                      )}
                    </p>
                  )}
                </div>

                {/* Fechar */}
                <div className="border-t pt-4">
                  <Button
                    onClick={() => setShowDetails(false)}
                    className="w-full"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
