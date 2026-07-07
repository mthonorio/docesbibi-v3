"use client";

import { useState } from "react";
import { ModelSelector } from "@/components/molecules/ModelSelector";
import { FlavorPicker } from "@/components/molecules/FlavorPicker";
import { EASTER_FLAVORS } from "@/constants/easter";
import { useCustomEasterEgg } from "@/hooks/useCustomEasterEgg";
import {
  useEasterProducts,
  type EasterProduct,
} from "@/hooks/useEasterProducts";
import { useCartStore } from "@/store/cart.store";
import type { EasterModelType } from "@/types/api";

// Mapear nomes de produtos do banco para EasterModelType
function mapProductNameToModelType(productName: string): EasterModelType {
  if (productName.includes("Trio")) return "trio_50g";
  if (productName.includes("Duo")) return "duo_150g";
  if (productName.includes("400g")) return "400g";
  return "150g"; // padrão
}

export function CustomEasterEgg() {
  const { addToCart } = useCartStore();
  const { products: easterProducts, loading, error } = useEasterProducts();
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
  } = useCustomEasterEgg(easterProducts);

  const [toast, setToast] = useState<{ message: string; show: boolean }>({
    message: "",
    show: false,
  });

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: "", show: false }), 3000);
  };

  // Encontrar o produto selecionado matchando pelo EasterModelType
  const getProductByModelType = (
    modelType: EasterModelType | null,
  ): EasterProduct | undefined => {
    if (!modelType) return undefined;

    const flavorCount =
      modelType === "trio_50g" ? 3 : modelType === "duo_150g" ? 2 : 1;

    return easterProducts.find((product) => {
      const productFlavorCount = product.name.includes("Trio")
        ? 3
        : product.name.includes("Duo")
          ? 2
          : 1;

      const sizeMatch =
        (modelType === "150g" &&
          product.name.includes("150g") &&
          !product.name.includes("Duo")) ||
        (modelType === "duo_150g" && product.name.includes("Duo")) ||
        (modelType === "trio_50g" && product.name.includes("Trio")) ||
        (modelType === "400g" && product.name.includes("400g"));

      return productFlavorCount === flavorCount && sizeMatch;
    });
  };

  const selectedProduct = getProductByModelType(selectedModel);

  // Mapear produtos para o formato esperado pelo ModelSelector
  const mappedModels = easterProducts.map((product) => {
    const modelType = mapProductNameToModelType(product.name);
    return {
      type: modelType,
      label: product.name.replace("Ovo de Páscoa ", ""),
      price: product.price,
      flavorCount: product.name.includes("Trio")
        ? 3
        : product.name.includes("Duo")
          ? 2
          : 1,
      description: product.description,
      image: product.image,
    };
  });

  const handleAddToCart = () => {
    const egg = getCustomEgg();
    if (!egg || !selectedProduct) return;

    // Criar um "produto" com os dados do banco de dados
    // IMPORTANTE: usar product_db_id como o ID principal para pagamento seguro
    const customProduct = {
      id: selectedProduct.id, // UUID do banco de dados - usado no pagamento
      name: `${selectedProduct.name} (${selectedFlavors.join(" + ")})`,
      category: "easter",
      price: selectedProduct.price,
      image: selectedProduct.image,
      description: `${selectedProduct.description} | Sabores: ${selectedFlavors.join(", ")}`,
      customized: true,
      flavors: selectedFlavors,
    };

    addToCart(customProduct as any);
    showToast("Ovo de Páscoa customizado adicionado ao carrinho!");

    // Resetar para permite nova customização
    resetSelection();
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-rosa-200 border-t-rosa-800 rounded-full mx-auto mb-4"></div>
          <p className="text-marrom-600">Carregando ovos de Páscoa...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 p-6 rounded-lg">
          <p className="text-red-600 font-semibold">Erro ao carregar ovos</p>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (easterProducts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-marrom-600 text-lg">
            Nenhum ovo de Páscoa disponível no momento
          </p>
        </div>
      </div>
    );
  }

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
          models={mappedModels}
          selectedModel={selectedModel}
          onSelectModel={selectModel}
        />
      </div>

      {/* Step 2: Flavor Selection (só aparece após selecionar modelo) */}
      {selectedModel && selectedProduct && (
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <FlavorPicker
            flavors={EASTER_FLAVORS}
            selectedFlavors={selectedFlavors}
            maxFlavors={
              selectedProduct.name.includes("Trio")
                ? 3
                : selectedProduct.name.includes("Duo")
                  ? 2
                  : 1
            }
            onToggleFlavor={toggleFlavor}
            onRemoveFlavor={removeFlavor}
          />
        </div>
      )}

      {/* Summary and Action */}
      {selectedModel && selectedProduct && (
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
                    {selectedProduct.name.replace("Ovo de Páscoa ", "")}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-rosa-200">
                  <span className="text-marrom-600">Sabores:</span>
                  <span className="font-semibold text-marrom-800">
                    {selectedFlavors.length}/
                    {selectedProduct.name.includes("Trio")
                      ? 3
                      : selectedProduct.name.includes("Duo")
                        ? 2
                        : 1}
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
                  {selectedProduct.name.includes("Trio")
                    ? 3
                    : selectedProduct.name.includes("Duo")
                      ? 2
                      : 1}{" "}
                  sabor
                  {(selectedProduct.name.includes("Trio")
                    ? 3
                    : selectedProduct.name.includes("Duo")
                      ? 2
                      : 1) > 1
                    ? "es"
                    : ""}
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
