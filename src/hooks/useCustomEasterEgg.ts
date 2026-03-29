"use client";

import { useState, useCallback } from "react";
import type { EasterModelType, CustomEasterEgg } from "@/types/api";
import { EASTER_MODELS } from "@/constants/easter";

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

export function useCustomEasterEgg(): UseCustomEasterEggReturn {
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
        const modelConfig = EASTER_MODELS.find((m) => m.type === selectedModel);
        if (!modelConfig) return prev;

        const maxFlavors = modelConfig.flavorCount;

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

  const modelConfig = EASTER_MODELS.find((m) => m.type === selectedModel);
  const isComplete =
    selectedModel !== null &&
    selectedFlavors.length === (modelConfig?.flavorCount || 0);

  const getCustomEgg = useCallback((): CustomEasterEgg | null => {
    if (!selectedModel || !isComplete) return null;

    const price = modelConfig?.price || 0;
    return {
      model: selectedModel,
      flavors: selectedFlavors,
      price,
      quantity: 1,
    };
  }, [selectedModel, isComplete, selectedFlavors, modelConfig]);

  const getPrice = useCallback((): number => {
    return modelConfig?.price || 0;
  }, [modelConfig]);

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
