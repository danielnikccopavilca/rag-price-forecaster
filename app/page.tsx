"use client"

import { useState, useEffect } from "react"
import { CalendarClock, Database } from "lucide-react"
import { ProductSidebar } from "@/components/product-sidebar"
import { KpiCards } from "@/components/kpi-cards"
import { PriceChart } from "@/components/price-chart"
import { RagChat } from "@/components/rag-chat"
import { getProduct, type ProductId } from "@/lib/data"

// Función para regenerar las fechas y el punto de empalme exacto al día de hoy (24 Oct)
function generarFechasDinamicas(serieOriginal: any[], valorPrediccionFinal?: number) {
  const hoy = new Date() // Toma la fecha actual (24 de Octubre)
  const totalPuntos = serieOriginal.length // 10 puntos en la serie
  
  // El antepenúltimo punto (índice 7) se fija en HOY (24 Oct)
  const indiceHoy = totalPuntos - 3
  const diasIntervalo = 2.3 

  return serieOriginal.map((item, index) => {
    // 1. Calcular la fecha formateada para cada punto
    const diasDiferencia = Math.round((index - indiceHoy) * diasIntervalo)
    const fechaPunto = new Date(hoy)
    fechaPunto.setDate(hoy.getDate() + diasDiferencia)

    const dia = fechaPunto.getDate()
    const mes = fechaPunto.toLocaleDateString("es-ES", { month: "short" })
    const fechaFormateada = `${dia} ${mes.charAt(0).toUpperCase() + mes.slice(1)}`

    // Extraer el precio numérico base del objeto original
    const precioBase = item.historico ?? item.prediccion ?? 4.0

    // 2. Reestructurar el corte exacto de Histórico y Predicción
    let nuevoHistorico: number | null = null
    let nuevaPrediccion: number | null = null

    if (index < indiceHoy) {
      // Puntos pasados: Solo curva histórica sólida
      nuevoHistorico = precioBase
      nuevaPrediccion = null
    } else if (index === indiceHoy) {
      // Punto actual (HOY): Punto de empalme donde se cruzan las líneas
      nuevoHistorico = precioBase
      nuevaPrediccion = precioBase
    } else if (index === totalPuntos - 1 && valorPrediccionFinal) {
      // Último punto (t+7): Valor predicho enviado por la API en Render
      nuevoHistorico = null
      nuevaPrediccion = valorPrediccionFinal
    } else {
      // Puntos intermedios del horizonte de predicción
      nuevoHistorico = null
      nuevaPrediccion = precioBase
    }

    return {
      fecha: fechaFormateada,
      date: fechaFormateada, // Asegura compatibilidad con PriceChart
      historico: nuevoHistorico,
      prediccion: nuevaPrediccion,
    }
  })
}

export default function Page() {
  const [selected, setSelected] = useState<ProductId>("arroz")
  
  // Producto base del archivo local data.ts
  const localProduct = getProduct(selected)
  
  const [product, setProduct] = useState(localProduct)
  const [loading, setLoading] = useState(false)

  // Fecha actual formateada para el encabezado
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
          
          // Ajuste de escala o uso del valor predicho enviado por Render
          const valorPrediccion = data.prediccion_t7 < 2 
            ? Number((localProduct.precioActual * (1 + (data.prediccion_t7 - 0.80) * 0.1)).toFixed(2))
            : Number(data.prediccion_t7.toFixed(2))

          const variacionCalculada = Number((((valorPrediccion - localProduct.precioActual) / localProduct.precioActual) * 100).toFixed(1))

          // AQUÍ ESTÁ EXACTAMENTE EL CÓDIGO QUE BUSCABAS:
          const nuevaSerie = generarFechasDinamicas(localProduct.serie, valorPrediccion)

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
        
        // En caso de fallo de red, igual ajustamos el gráfico a las fechas de hoy
        setProduct({
          ...localProduct,
          serie: generarFechasDinamicas(localProduct.serie)
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
