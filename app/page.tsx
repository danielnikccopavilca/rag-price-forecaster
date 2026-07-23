"use client"

import { useState } from "react"
import { CalendarClock, Database } from "lucide-react"
import { ProductSidebar } from "@/components/product-sidebar"
import { KpiCards } from "@/components/kpi-cards"
import { PriceChart } from "@/components/price-chart"
import { RagChat } from "@/components/rag-chat"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  getDistrict,
  getProduct,
  type DistrictId,
  type ProductId,
} from "@/lib/data"

export default function Page() {
  const [selected, setSelected] = useState<ProductId>("papa")
  const [districtId, setDistrictId] = useState<DistrictId>("lima-sur")
  const product = getProduct(selected)
  const district = getDistrict(districtId)

  return (
    <div className="flex min-h-svh flex-col bg-background md:flex-row">
      <div className="md:sticky md:top-0 md:h-svh">
        <ProductSidebar
          selected={selected}
          onSelect={setSelected}
          district={districtId}
          onDistrictChange={setDistrictId}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-col gap-3 border-b border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <h1 className="text-balance text-xl font-semibold text-foreground">
              {product.nombre}
            </h1>
            <p className="text-sm text-muted-foreground">
              Panel de predicción de precios · {product.categoria} ·{" "}
              {district.nombre}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden flex-wrap items-center gap-4 text-xs text-muted-foreground sm:flex">
              <span className="flex items-center gap-1.5">
                <Database className="size-3.5" aria-hidden="true" />
                MIDAGRI · BCRP · SENAMHI
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarClock className="size-3.5" aria-hidden="true" />
                Jun 2025
              </span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 px-5 py-6 sm:px-8">
          <KpiCards product={product} district={district} />
          <PriceChart product={product} district={district} />
          <div className="min-h-[460px]">
            <RagChat product={product} />
          </div>
        </main>
      </div>
    </div>
  )
}
