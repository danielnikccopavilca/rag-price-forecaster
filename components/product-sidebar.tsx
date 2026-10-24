"use client"

import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { PRODUCTS, type ProductId, type Product } from "@/lib/data"
import { cn } from "@/lib/utils"

interface ProductSidebarProps {
  selected: ProductId
  onSelect: (id: ProductId) => void
  productsList?: Product[] // Permite recibir la lista con variaciones en vivo
}

export function ProductSidebar({ selected, onSelect, productsList }: ProductSidebarProps) {
  const items = productsList || PRODUCTS

  return (
    <aside className="w-full border-r border-border bg-card md:w-64 md:shrink-0">
      <div className="flex h-16 items-center border-b border-border px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="font-bold text-xs">AI</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground leading-none">
              RAG Price Forecaster
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">
              Predicción de precios · Perú
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Productos Monitoreados
        </p>
        <nav className="flex flex-col gap-1">
          {items.map((prod) => {
            const isSelected = prod.id === selected
            const isUp = prod.variacion >= 0

            return (
              <button
                key={prod.id}
                onClick={() => onSelect(prod.id as ProductId)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "text-foreground hover:bg-muted/60"
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-tight">
                    {prod.nombre}
                  </p>
                  <p
                    className={cn(
                      "truncate text-xs mt-0.5",
                      isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}
                  >
                    {prod.categoria}
                  </p>
                </div>

                <div
                  className={cn(
                    "flex items-center gap-0.5 text-xs font-semibold ml-2 shrink-0",
                    isSelected
                      ? isUp
                        ? "text-emerald-300"
                        : "text-rose-300"
                      : isUp
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
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
    </aside>
  )
}
