"use client";

import { useState } from "react";
import { ModelSelector } from "@/components/molecules/ModelSelector";
import { FlavorPicker } from "@/components/molecules/FlavorPicker";
import { EASTER_MODELS, EASTER_FLAVORS } from "@/constants/easter";
import { useCustomEasterEgg } from "@/hooks/useCustomEasterEgg";
import { useCartStore } from "@/store/cart.store";

export function CustomEasterEgg() {
  const { addToCart } = useCartStore();
  const {
    selectedModel,
    selectedFlavors,
    selectModel,
    toggleFlavor,
    removeFlavor,
    resetSelection,
    isComplete,
    getCustomEgg,
    getPrice,
  } = useCustomEasterEgg();

  const [toast, setToast] = useState<{ message: string; show: boolean }>({
    message: "",
    show: false,
  });

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: "", show: false }), 3000);
  };

  const modelConfig = EASTER_MODELS.find((m) => m.type === selectedModel);

  const handleAddToCart = () => {
    const egg = getCustomEgg();
    if (!egg) return;

    // Criar um "produto" virtual para o ovo customizado
    const customProduct = {
      id: `easter-${selectedModel}-${Date.now()}`, // ID único
      name: `Ovo de Páscoa ${selectedModel} (${selectedFlavors.join(" + ")})`,
      category: "pascoa",
      price: getPrice(),
      image: modelConfig?.image || "",
      description: `Ovo customizado com sabores: ${selectedFlavors.join(", ")}`,
      customized: true,
      flavors: selectedFlavors,
      model_type: selectedModel,
    };

    addToCart(customProduct as any);
    showToast("Ovo de Páscoa customizado adicionado ao carrinho!");

    // Resetar para permite nova customização
    resetSelection();
  };

  return (
    <div className="space-y-12 py-12">
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-bounce">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          {toast.message}
        </div>
      )}

      {/* Step 1: Model Selection */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <ModelSelector
          models={EASTER_MODELS}
          selectedModel={selectedModel}
          onSelectModel={selectModel}
        />
      </div>

      {/* Step 2: Flavor Selection (só aparece após selecionar modelo) */}
      {selectedModel && modelConfig && (
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <FlavorPicker
            flavors={EASTER_FLAVORS}
            selectedFlavors={selectedFlavors}
            maxFlavors={modelConfig.flavorCount}
            onToggleFlavor={toggleFlavor}
            onRemoveFlavor={removeFlavor}
          />
        </div>
      )}

      {/* Summary and Action */}
      {selectedModel && (
        <div className="bg-rosa-50 rounded-2xl p-8 border-2 border-rosa-200">
          <div className="max-w-2xl mx-auto">
            {/* Resumo do pedido */}
            <div className="bg-white rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-marrom-800 mb-4">
                Seu Ovo Customizado
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center pb-3 border-b border-rosa-200">
                  <span className="text-marrom-600">Modelo:</span>
                  <span className="font-semibold text-marrom-800">
                    {modelConfig?.label}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-rosa-200">
                  <span className="text-marrom-600">Sabores:</span>
                  <span className="font-semibold text-marrom-800">
                    {selectedFlavors.length}/{modelConfig?.flavorCount}
                  </span>
                </div>

                {selectedFlavors.length > 0 && (
                  <div className="pt-3">
                    <p className="text-marrom-600 mb-2">Selecionados:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedFlavors.map((flavor, idx) => (
                        <span
                          key={`${flavor}-${idx}`}
                          className="bg-rosa-100 text-rosa-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {flavor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t-2 border-rosa-200">
                  <span className="text-lg font-bold text-marrom-800">
                    Total:
                  </span>
                  <span className="text-2xl font-bold text-rosa-800">
                    R$ {getPrice().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={resetSelection}
                  className="flex-1 px-6 py-3 border-2 border-rosa-400 text-rosa-800 font-bold rounded-lg hover:bg-rosa-50 transition-colors"
                >
                  Recomeçar
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={!isComplete}
                  className={`flex-1 px-6 py-3 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    isComplete
                      ? "bg-rosa-800 text-white hover:bg-rosa-900"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {isComplete ? "Adicionar ao Carrinho" : "Complete a seleção"}
                </button>
              </div>
            </div>

            {/* Info Text */}
            {!isComplete && (
              <p className="text-center text-marrom-600 text-sm">
                ✨ Você precisa selecionar{" "}
                <span className="font-semibold">
                  {modelConfig?.flavorCount} sabor
                  {modelConfig && modelConfig.flavorCount > 1 ? "es" : ""}
                </span>{" "}
                para continuar
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
