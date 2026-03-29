import { CreateOrderForm } from "@/components/forms/CreateOrderForm";
import { OrdersManager } from "@/components/sections/OrdersManager";

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Título da Página */}
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Gerenciador de Pedidos</h1>
          <p className="text-gray-600">
            Crie, visualize e gerencie seus pedidos com facilidade.
          </p>
        </section>

        {/* Grid com Formulário e Gerenciador */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna 1: Formulário de Criação */}
          <div className="lg:col-span-1">
            <CreateOrderForm />
          </div>

          {/* Coluna 2: Gerenciador de Pedidos */}
          <div className="lg:col-span-2">
            <OrdersManager />
          </div>
        </div>
      </div>
    </main>
  );
}
