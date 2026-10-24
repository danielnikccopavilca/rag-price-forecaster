"use client"

import { Activity, ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { Product } from "@/lib/data"
import { cn } from "@/lib/utils"

export function KpiCards({ product }: { product: Product }) {
  const isUp = product.variacion >= 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="gap-0 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Precio actual
          </p>
          <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Wallet className="size-4.5" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-3 text-3xl font-semibold tabular-nums text-foreground">
          S/ {product.precioActual.toFixed(2)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {product.unidad} · mercado mayorista
        </p>
      </Card>

      <Card className="gap-0 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Predicción a 7 días
          </p>
          <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Activity className="size-4.5" aria-hidden="true" />
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <p className="text-3xl font-semibold tabular-nums text-foreground">
            S/ {product.prediccion7d.toFixed(2)}
          </p>
          <span
            className={cn(
              "flex items-center gap-0.5 text-sm font-semibold",
              // Verde para incremento (+), Rojo para caída (-)
              isUp 
                ? "text-emerald-600 dark:text-emerald-400" 
                : "text-rose-600 dark:text-rose-400",
            )}
          >
            {isUp ? (
              <ArrowUpRight className="size-4" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="size-4" aria-hidden="true" />
            )}
            {isUp ? "+" : ""}
            {product.variacion.toFixed(1)}%
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Proyección estimada al horizonte semanal
        </p>
      </Card>

      <Card className="gap-0 p-5 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Confianza del modelo
          </p>
          <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
            XGBoost + LSTM
          </span>
        </div>
        <p className="mt-3 text-3xl font-semibold tabular-nums text-foreground">
          {product.confianza}%
        </p>
        <div
          className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={product.confianza}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Confianza del modelo"
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${product.confianza}%` }}
          />
        </div>
      </Card>
    </div>
  )
}
