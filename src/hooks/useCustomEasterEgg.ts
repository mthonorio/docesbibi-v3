"use client";

import { useState, useCallback } from "react";
import type { EasterModelType, CustomEasterEgg } from "@/types/api";
import type { EasterProduct } from "./useEasterProducts";

interface UseCustomEasterEggReturn {
  selectedModel: EasterModelType | null;
  selectedFlavors: string[];
  selectModel: (model: EasterModelType) => void;
  toggleFlavor: (flavor: string) => void;
  removeFlavor: (index: number) => void;
  resetSelection: () => void;
  isComplete: boolean;
  getCustomEgg: () => CustomEasterEgg | null;
  getPrice: () => number;
}

// Função auxiliar para obter flavorCount pelo EasterModelType
function getFlavorCountByType(modelType: EasterModelType): number {
  switch (modelType) {
    case "trio_50g":
      return 3;
    case "duo_150g":
      return 2;
    case "150g":
    case "400g":
      return 1;
    default:
      return 1;
  }
}

// Função auxiliar para encontrar produto pelo EasterModelType
function findProductByModelType(
  products: EasterProduct[],
  modelType: EasterModelType,
): EasterProduct | undefined {
  const flavorCount = getFlavorCountByType(modelType);

  return products.find((product) => {
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
}

export function useCustomEasterEgg(
  products: EasterProduct[] = [],
): UseCustomEasterEggReturn {
  const [selectedModel, setSelectedModel] = useState<EasterModelType | null>(
    null,
  );
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);

  const selectModel = useCallback((model: EasterModelType) => {
    setSelectedModel(model);
    setSelectedFlavors([]); // Reset flavors quando muda modelo
  }, []);

  const toggleFlavor = useCallback(
    (flavor: string) => {
      setSelectedFlavors((prev) => {
        if (!selectedModel) return prev;

        const maxFlavors = getFlavorCountByType(selectedModel);

        // Se já tem o sabor, remove
        if (prev.includes(flavor)) {
          return prev.filter((f) => f !== flavor);
        }

        // Se ainda pode adicionar mais sabores
        if (prev.length < maxFlavors) {
          return [...prev, flavor];
        }

        return prev;
      });
    },
    [selectedModel],
  );

  const removeFlavor = useCallback((index: number) => {
    setSelectedFlavors((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const resetSelection = useCallback(() => {
    setSelectedModel(null);
    setSelectedFlavors([]);
  }, []);

  const selectedProduct =
    selectedModel !== null
      ? findProductByModelType(products, selectedModel)
      : undefined;
  const maxFlavors = selectedModel ? getFlavorCountByType(selectedModel) : 0;
  const isComplete =
    selectedModel !== null && selectedFlavors.length === maxFlavors;

  const getCustomEgg = useCallback((): CustomEasterEgg | null => {
    if (!selectedModel || !isComplete || !selectedProduct) return null;

    return {
      model: selectedModel,
      flavors: selectedFlavors,
      price: selectedProduct.price,
      quantity: 1,
    };
  }, [selectedModel, isComplete, selectedFlavors, selectedProduct]);

  const getPrice = useCallback((): number => {
    return selectedProduct?.price || 0;
  }, [selectedProduct]);

  return {
    selectedModel,
    selectedFlavors,
    selectModel,
    toggleFlavor,
    removeFlavor,
    resetSelection,
    isComplete,
    getCustomEgg,
    getPrice,
  };
}
