"use client"

import { useState } from "react"
import { CalendarClock, Database } from "lucide-react"
import { ProductSidebar } from "@/components/product-sidebar"
import { KpiCards } from "@/components/kpi-cards"
import { PriceChart } from "@/components/price-chart"
import { RagChat } from "@/components/rag-chat"
import { getProduct, type ProductId } from "@/lib/data"

export default function Page() {
  const [selected, setSelected] = useState<ProductId>("pollo")
  const product = getProduct(selected)

  return (
    <div className="flex min-h-svh flex-col bg-background md:flex-row">
      <div className="md:sticky md:top-0 md:h-svh">
        <ProductSidebar selected={selected} onSelect={setSelected} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-col gap-3 border-b border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <h1 className="text-xl font-semibold text-foreground text-balance">
              {product.nombre}
            </h1>
            <p className="text-sm text-muted-foreground">
              Panel de predicción de precios · {product.categoria}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Database className="size-3.5" aria-hidden="true" />
              Fuente: MIDAGRI · BCRP
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarClock className="size-3.5" aria-hidden="true" />
              Actualizado: 20 Jun 2025
            </span>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 px-5 py-6 sm:px-8">
          <KpiCards product={product} />

          <div className="grid flex-1 grid-cols-1 gap-6 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <PriceChart product={product} />
            </div>
            <div className="min-h-[420px] xl:col-span-2">
              <RagChat product={product} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
