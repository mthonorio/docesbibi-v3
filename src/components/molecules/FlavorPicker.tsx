"use client";

import type { EasterFlavor } from "@/types/api";

interface FlavorPickerProps {
  flavors: EasterFlavor[];
  selectedFlavors: string[];
  maxFlavors: number;
  onToggleFlavor: (flavor: string) => void;
  onRemoveFlavor: (index: number) => void;
}

export function FlavorPicker({
  flavors,
  selectedFlavors,
  maxFlavors,
  onToggleFlavor,
  onRemoveFlavor,
}: FlavorPickerProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-marrom-800 mb-2">
          Escolha os Sabores
        </h2>
        <p className="text-marrom-600">
          Selecione {maxFlavors} sabor{maxFlavors > 1 ? "es" : ""} para seu ovo
        </p>
        <div className="mt-3 flex justify-center gap-2">
          {Array.from({ length: maxFlavors }).map((_, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-all ${
                i < selectedFlavors.length
                  ? "bg-rosa-800 scale-100"
                  : "bg-rosa-300 scale-75"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Sabores selecionados */}
      {selectedFlavors.length > 0 && (
        <div className="bg-rosa-50 rounded-xl p-6 border-2 border-rosa-200">
          <h3 className="font-semibold text-marrom-800 mb-4">
            Sabores Selecionados ({selectedFlavors.length}/{maxFlavors}):
          </h3>
          <div className="space-y-3">
            {selectedFlavors.map((flavor, index) => (
              <div
                key={`${flavor}-${index}`}
                className="flex items-center justify-between bg-white p-4 rounded-lg border-l-4 border-rosa-800"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-bold text-rosa-800 text-lg">
                    #{index + 1}
                  </span>
                  <span className="font-semibold text-marrom-800">
                    {flavor}
                  </span>
                </div>
                <button
                  onClick={() => onRemoveFlavor(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid de sabores disponíveis */}
      <div>
        <h3 className="font-semibold text-marrom-800 mb-4">
          Sabores Disponíveis:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {flavors.map((flavor) => {
            const isSelected = selectedFlavors.includes(flavor.name);
            const isFull = selectedFlavors.length >= maxFlavors;
            const isDisabled = !isSelected && isFull;

            return (
              <button
                key={flavor.id}
                onClick={() => !isDisabled && onToggleFlavor(flavor.name)}
                disabled={isDisabled}
                className={`relative group cursor-pointer transition-all transform p-4 rounded-xl border-2 ${
                  isSelected
                    ? "border-rosa-800 bg-rosa-50 ring-2 ring-rosa-300"
                    : isDisabled
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                      : "border-rosa-200 bg-white hover:border-rosa-400 hover:scale-105"
                }`}
              >
                {/* Cor de referência */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 border-2 border-white shadow-md mt-1"
                    style={{ backgroundColor: flavor.color_hex }}
                  />

                  <div className="flex-1 text-left">
                    <p className="font-semibold text-marrom-800">
                      {flavor.name}
                    </p>
                    <p className="text-sm text-marrom-600 line-clamp-2">
                      {flavor.description}
                    </p>
                  </div>

                  {/* Checkmark quando selecionado */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-rosa-800 text-white p-1 rounded-full">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
