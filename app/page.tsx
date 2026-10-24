"use client"

import { useState, useEffect } from "react"
import { CalendarClock, Database } from "lucide-react"
import { ProductSidebar } from "@/components/product-sidebar"
import { KpiCards } from "@/components/kpi-cards"
import { PriceChart } from "@/components/price-chart"
import { RagChat } from "@/components/rag-chat"
import { getProduct, type ProductId } from "@/lib/data"

export default function Page() {
  const [selected, setSelected] = useState<ProductId>("arroz")
  
  // Producto local base de data.ts
  const localProduct = getProduct(selected)
  
  const [product, setProduct] = useState(localProduct)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchApiData() {
      setLoading(true)
      try {
        const nombreProducto = localProduct.nombre
        const res = await fetch(
          `https://rag-price-forecaster-api.onrender.com/api/predict?producto=${encodeURIComponent(nombreProducto)}`
        )
        
        if (res.ok) {
          const data = await res.json()
          
          // Si la API devuelve un valor en rango 0-1 (normalizado), proyectamos proporcionalmente al precio actual
          // Si la API devuelve el precio real en soles, lo usamos directamente.
          const valorPrediccion = data.prediccion_t7 < 2 
            ? Number((localProduct.precioActual * (1 + (data.prediccion_t7 - 0.80) * 0.1)).toFixed(2))
            : Number(data.prediccion_t7.toFixed(2))

          // Calculamos la variación %
          const variacionCalculada = Number((((valorPrediccion - localProduct.precioActual) / localProduct.precioActual) * 100).toFixed(1))

          // Actualizamos la serie del gráfico haciendo que el último punto coincida con valorPrediccion
          const nuevaSerie = [...localProduct.serie]
          if (nuevaSerie.length > 0) {
            nuevaSerie[nuevaSerie.length - 1] = {
              ...nuevaSerie[nuevaSerie.length - 1],
              prediccion: valorPrediccion
            }
          }

          setProduct({
            ...localProduct,
            prediccion7d: valorPrediccion,
            variacion: variacionCalculada,
            serie: nuevaSerie,
            respuestaRag: data.contexto_rag ? data.contexto_rag.join(" ") : localProduct.respuestaRag,
          })
        }
      } catch (error) {
        console.error("Error al conectar con Render, usando datos de respaldo:", error)
        setProduct(localProduct)
      } finally {
        setLoading(false)
      }
    }

    fetchApiData()
  }, [selected])

  return (
    <div className="flex min-h-svh flex-col bg-background md:flex-row">
      <div className="md:sticky md:top-0 md:h-svh">
        <ProductSidebar selected={selected} onSelect={setSelected} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-col gap-3 border-b border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <h1 className="text-xl font-semibold text-foreground text-balance flex items-center gap-2">
              {product.nombre}
              {loading && <span className="text-xs text-muted-foreground animate-pulse">(Conectando IA...)</span>}
            </h1>
            <p className="text-sm text-muted-foreground">
              Panel de predicción de precios · {product.categoria}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Database className="size-3.5" aria-hidden="true" />
              Fuente: MIDAGRI · BCRP · Render API
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarClock className="size-3.5" aria-hidden="true" />
              Actualizado: En vivo (t+7)
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
