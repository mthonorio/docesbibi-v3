"use client";

import Image from "next/image";
import type { EasterModel, EasterModelType } from "@/types/api";

interface ModelSelectorProps {
  models: EasterModel[];
  selectedModel: EasterModelType | null;
  onSelectModel: (model: EasterModelType) => void;
}

export function ModelSelector({
  models,
  selectedModel,
  onSelectModel,
}: ModelSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-marrom-800 mb-2">
          Escolha o Tamanho
        </h2>
        <p className="text-marrom-600">Selecione o modelo de ovo que deseja</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {models.map((model) => (
          <button
            key={model.type}
            onClick={() => onSelectModel(model.type)}
            className={`relative group cursor-pointer transition-all transform hover:scale-105 ${
              selectedModel === model.type ? "ring-4 ring-rosa-800" : ""
            }`}
          >
            {/* Card */}
            <div
              className={`rounded-2xl overflow-hidden shadow-lg transition-all ${
                selectedModel === model.type
                  ? "bg-rosa-100 border-4 border-rosa-800"
                  : "bg-white border-2 border-rosa-200 hover:border-rosa-400"
              }`}
            >
              {/* Imagem */}
              <div className="relative w-full h-56 bg-rosa-50 overflow-hidden">
                <img
                  src={model.image}
                  alt={model.label}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />

                {/* Badge de sabores */}
                <div className="absolute top-3 right-3 bg-rosa-800 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {model.flavorCount} sabor{model.flavorCount > 1 ? "es" : ""}
                </div>

                {/* Check mark quando selecionado */}
                {selectedModel === model.type && (
                  <div className="absolute inset-0 bg-rosa-800 bg-opacity-20 flex items-center justify-center">
                    <div className="bg-rosa-800 text-white p-3 rounded-full">
                      <svg
                        className="w-8 h-8"
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
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5 text-center">
                <h3 className="text-xl font-bold text-marrom-800 mb-2">
                  {model.label}
                </h3>
                <p className="text-sm text-marrom-600 mb-3 line-clamp-2">
                  {model.description}
                </p>
                <p className="text-2xl font-bold text-rosa-800">
                  R$ {model.price.toFixed(2)}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
