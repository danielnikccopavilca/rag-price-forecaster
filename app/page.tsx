"use client"

import { useState, useEffect } from "react"
import { CalendarClock, Database } from "lucide-react"
import { ProductSidebar } from "@/components/product-sidebar"
import { KpiCards } from "@/components/kpi-cards"
import { PriceChart } from "@/components/price-chart"
import { RagChat } from "@/components/rag-chat"
import { getProduct, type ProductId } from "@/lib/data"

export default function Page() {
  const [selected, setSelected] = useState<ProductId>("pollo")
  
  // Producto local de respaldo (data.ts) mientras carga o si falla la API
  const localProduct = getProduct(selected)
  
  // Estado para guardar el producto enriquecido con la API de Render
  const [product, setProduct] = useState(localProduct)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchApiData() {
      setLoading(true)
      try {
        // Llamada a tu API en Render usando el nombre del producto local
        const nombreProducto = localProduct.nombre
        const res = await fetch(
          `https://rag-price-forecaster-api.onrender.com/api/predict?producto=${encodeURIComponent(nombreProducto)}`
        )
        
        if (res.ok) {
          const data = await res.json()
          
          // Fusionamos la data de Render con la estructura que tus componentes esperan
          setProduct({
            ...localProduct,
            prediccion7d: data.prediccion_t7,
            unidad: data.unidad,
            // Si la API devuelve el contexto RAG, lo adaptamos al formato de citas de tu UI
            respuestaRag: data.contexto_rag ? data.contexto_rag.join(" ") : localProduct.respuestaRag,
            // Opcional: si quieres inyectar las métricas de la tesis en alguna parte
          })
        }
      } catch (error) {
        console.error("No se pudo conectar con el backend en Render, usando datos locales:", error)
        setProduct(localProduct)
      } finally {
        setLoading(false)
      }
    }

    fetchApiData()
  }, [selected]) // Se ejecuta cada vez que el usuario cambia de producto en la barra lateral

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
              {loading && <span className="text-xs text-muted-foreground animate-pulse">(Actualizando IA...)</span>}
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
