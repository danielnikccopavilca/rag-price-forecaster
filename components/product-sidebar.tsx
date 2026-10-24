"use client"

import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { PRODUCTS, type ProductId, type Product } from "@/lib/data"
import { cn } from "@/lib/utils"

interface ProductSidebarProps {
  selected: ProductId
  onSelect: (id: ProductId) => void
  productsList?: Product[]
}

export function ProductSidebar({ selected, onSelect, productsList }: ProductSidebarProps) {
  const items = productsList || PRODUCTS

  return (
    <aside className="w-full border-r border-border bg-[#0f172a] text-slate-100 md:w-64 md:shrink-0 h-full flex flex-col">
      {/* Header Logo */}
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shadow-md">
            AI
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white leading-none">
              RAG Price Forecaster
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">
              Predicción de precios · Perú
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Productos */}
      <div className="p-4 flex-1">
        <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Productos Monitoreados
        </p>
        <nav className="flex flex-col gap-1.5">
          {items.map((prod) => {
            const isSelected = prod.id === selected
            const isUp = prod.variacion >= 0

            return (
              <button
                key={prod.id}
                onClick={() => onSelect(prod.id as ProductId)}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3.5 py-3 text-left text-sm transition-all duration-200",
                  isSelected
                    ? "bg-blue-600 text-white font-medium shadow-md"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-tight">
                    {prod.nombre}
                  </p>
                  <p
                    className={cn(
                      "truncate text-xs mt-0.5",
                      isSelected ? "text-blue-100" : "text-slate-400"
                    )}
                  >
                    {prod.categoria}
                  </p>
                </div>

                <div
                  className={cn(
                    "flex items-center gap-0.5 text-xs font-semibold ml-2 shrink-0 px-1.5 py-0.5 rounded-md",
                    isSelected
                      ? isUp
                        ? "bg-emerald-500/20 text-emerald-200"
                        : "bg-rose-500/20 text-rose-200"
                      : isUp
                        ? "text-emerald-400"
                        : "text-rose-400"
                  )}
                >
                  {isUp ? (
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  ) : (
                    <ArrowDownRight className="size-3.5" aria-hidden="true" />
                  )}
                  {isUp ? "+" : ""}
                  {prod.variacion.toFixed(1)}%
                </div>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Footer del Sidebar */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400">
        <p className="line-clamp-2">
          Modelo híbrido <strong className="text-slate-200">XGBoost + LSTM</strong> con recuperación aumentada (RAG).
        </p>
      </div>
    </aside>
  )
}
