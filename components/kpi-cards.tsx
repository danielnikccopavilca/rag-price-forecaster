"use client"

import { Activity, ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { District, Product } from "@/lib/data"
import { cn } from "@/lib/utils"

export function KpiCards({
  product,
  district,
}: {
  product: Product
  district: District
}) {
  const isUp = product.variacion >= 0
  const precioActual = product.precioActual * district.factor
  const prediccion7d = product.prediccion7d * district.factor

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="gap-0 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Precio mayorista actual
          </p>
          <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Wallet className="size-[18px]" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-3 text-3xl font-semibold tabular-nums text-foreground">
          S/ {precioActual.toFixed(2)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {product.unidad} · {district.nombre}
        </p>
      </Card>

      <Card className="gap-0 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Predicción a 7 días
          </p>
          <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Activity className="size-[18px]" aria-hidden="true" />
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <p className="text-3xl font-semibold tabular-nums text-foreground">
            S/ {prediccion7d.toFixed(2)}
          </p>
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
              isUp
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive",
            )}
          >
            {isUp ? (
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="size-3.5" aria-hidden="true" />
            )}
            {isUp ? "+" : ""}
            {product.variacion.toFixed(1)}%
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Horizonte semanal del ensamble
        </p>
      </Card>

      <Card className="gap-0 p-5 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Nivel de confianza
          </p>
          <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
            XGBoost + LSTM
          </span>
        </div>
        <p className="mt-3 text-3xl font-semibold tabular-nums text-foreground">
          {product.confianza.toFixed(1)}%
        </p>
        <div
          className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={product.confianza}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Nivel de confianza del ensamble"
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
