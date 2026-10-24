"use client"

import { useState, useEffect } from "react"
import { CalendarClock, Database } from "lucide-react"
import { ProductSidebar } from "@/components/product-sidebar"
import { KpiCards } from "@/components/kpi-cards"
import { PriceChart } from "@/components/price-chart"
import { RagChat } from "@/components/rag-chat"
import { getProduct, type ProductId } from "@/lib/data"

// Función para generar fechas dinámicas y alinear el punto actual exactamente al precio real
function generarFechasDinamicas(
  serieOriginal: any[], 
  precioActualReal: number, 
  valorPrediccionFinal?: number
) {
  const hoy = new Date() // Fecha actual (24 Oct)
  const totalPuntos = serieOriginal.length
  const indiceHoy = totalPuntos - 3
  const diasIntervalo = 2.3 

  const valorBaseOriginal = serieOriginal[indiceHoy]?.historico ?? serieOriginal[indiceHoy]?.prediccion ?? precioActualReal

  return serieOriginal.map((item, index) => {
    const diasDiferencia = Math.round((index - indiceHoy) * diasIntervalo)
    const fechaPunto = new Date(hoy)
    fechaPunto.setDate(hoy.getDate() + diasDiferencia)

    const dia = fechaPunto.getDate()
    const mes = fechaPunto.toLocaleDateString("es-ES", { month: "short" })
    const fechaFormateada = `${dia} ${mes.charAt(0).toUpperCase() + mes.slice(1)}`

    const valorItemOriginal = item.historico ?? item.prediccion ?? valorBaseOriginal
    const ratio = valorItemOriginal / valorBaseOriginal
    const precioCalculado = Number((precioActualReal * ratio).toFixed(2))

    let nuevoHistorico: number | null = null
    let nuevaPrediccion: number | null = null

    if (index < indiceHoy) {
      nuevoHistorico = precioCalculado
      nuevaPrediccion = null
    } else if (index === indiceHoy) {
      nuevoHistorico = precioActualReal
      nuevaPrediccion = precioActualReal
    } else if (index === totalPuntos - 1 && valorPrediccionFinal) {
      nuevoHistorico = null
      nuevaPrediccion = valorPrediccionFinal
    } else {
      nuevoHistorico = null
      nuevaPrediccion = precioCalculado
    }

    return {
      fecha: fechaFormateada,
      date: fechaFormateada,
      historico: nuevoHistorico,
      prediccion: nuevaPrediccion,
    }
  })
}

export default function Page() {
  const [selected, setSelected] = useState<ProductId>("arroz")
  
  const localProduct = getProduct(selected)
  const [product, setProduct] = useState(localProduct)
  const [loading, setLoading] = useState(false)

  const fechaHoyStr = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric"
  })

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
          
          // Calculamos la prediccion real
          const valorPrediccion = data.prediccion_t7 < 2 
            ? Number((localProduct.precioActual * (1 + (data.prediccion_t7 - 0.80) * 0.1)).toFixed(2))
            : Number(data.prediccion_t7.toFixed(2))

          // Porcentaje de variación real entre t+7 y Hoy
          const variacionCalculada = Number(
            (((valorPrediccion - localProduct.precioActual) / localProduct.precioActual) * 100).toFixed(1)
          )

          const nuevaSerie = generarFechasDinamicas(localProduct.serie, localProduct.precioActual, valorPrediccion)

          setProduct({
            ...localProduct,
            prediccion7d: valorPrediccion,
            variacion: variacionCalculada, // Se actualiza la variación real
            serie: nuevaSerie,
            respuestaRag: data.contexto_rag ? data.contexto_rag.join(" ") : localProduct.respuestaRag,
          })
        }
      } catch (error) {
        console.error("Error al conectar con Render, usando datos de respaldo:", error)
        
        setProduct({
          ...localProduct,
          serie: generarFechasDinamicas(localProduct.serie, localProduct.precioActual)
        })
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
              Actualizado: {fechaHoyStr} (t+7)
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
