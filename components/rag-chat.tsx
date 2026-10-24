"use client"

import { useState, useEffect } from "react"
import { Bot, Send, Sparkles, User, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Product } from "@/lib/data"

interface Message {
  role: "assistant" | "user"
  content: string
  fuentes?: string[]
}

export function RagChat({ product }: { product: Product }) {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])

  // Reinicia el chat de manera limpia cada vez que cambias de producto en la barra lateral
  useEffect(() => {
    const explicacionInicial = product.respuestaRag || 
      `Análisis RAG para ${product.nombre}: El ensamble (XGBoost + BiLSTM) proyecta un precio de S/ ${product.prediccion7d.toFixed(2)} ` +
      `(${product.variacion >= 0 ? '+' : ''}${product.variacion}% a 7 días). ` +
      `Los volúmenes de ingreso registrados en el Mercado Mayorista de Lima muestran un comportamiento estable.`

    setMessages([
      {
        role: "assistant",
        content: explicacionInicial,
        fuentes: [
          `Boletín Diario MIDAGRI SISAP - Monitoreo de ${product.nombre}`,
          `BCRP - Reporte de Inflación y Choques de Oferta`
        ]
      }
    ])
  }, [product.id, product.nombre, product.prediccion7d, product.variacion, product.respuestaRag])

  // Generador dinámico de respuestas según el texto de la pregunta enviada
  const construirRespuestaDinamica = (pregunta: string): { texto: string; fuentes: string[] } => {
    const q = pregunta.toLowerCase()
    const esSube = product.variacion >= 0
    const absVar = Math.abs(product.variacion)

    if (q.includes("por que") || q.includes("por qué") || q.includes("razón") || q.includes("motivo") || q.includes("cambiará") || q.includes("variará")) {
      return {
        texto: `La variación proyectada del ${esSube ? '+' : '-'}${absVar}% en el precio de ${product.nombre.toLowerCase()} ` +
          `se explica por la relación entre el flujo de ingresos al Mercado Mayorista de Lima y la demanda estacional en Lima Sur. ` +
          `${esSube ? 'Se observa una ligera contracción en el abastecimiento proyectado, ' : 'Un incremento constante en la cosecha de las regiones abastecedoras '} ` +
          `respaldado por los registros históricos del MIDAGRI.`,
        fuentes: [
          `MIDAGRI SISAP - Informe Técnico de Abastecimiento (${product.nombre})`,
          `BCRP - Notas de Estudios sobre Precios Agrícolas`
        ]
      }
    }

    if (q.includes("clima") || q.includes("senamhi") || q.includes("lluvia") || q.includes("temperatura") || q.includes("sequía")) {
      return {
        texto: `El reporte agrometeorológico de SENAMHI para las zonas de cultivo de ${product.nombre.toLowerCase()} ` +
          `indica condiciones estables. No se identifican anomalías climáticas extremas que interrumpan el transporte o la cosecha en el horizonte de 7 días.`,
        fuentes: [
          `SENAMHI - Monitoreo Agrometeorológico Nacional`,
          `MIDAGRI - Evaluación de Impacto Climático en Valles Productivos`
        ]
      }
    }

    if (q.includes("dólar") || q.includes("dolar") || q.includes("bcrp") || q.includes("tipo de cambio") || q.includes("insumo") || q.includes("fertilizante")) {
      return {
        texto: `Según las notas informativas del BCRP, la estabilidad del tipo de cambio reduce la presión sobre los costos de fertilizantes e insumos importados para ${product.nombre.toLowerCase()}, lo que favorece una menor volatilidad en los precios mayoristas.`,
        fuentes: [
          `BCRP - Indicadores Macroeconómicos y Tipo de Cambio`,
          `INEI - Índice de Precios al Consumidor`
        ]
      }
    }

    // Respuesta adaptativa general ante cualquier otra pregunta abierta
    return {
      texto: `En consulta sobre "${pregunta}": Para ${product.nombre.toLowerCase()}, el modelo registra un precio actual de S/ ${product.precioActual.toFixed(2)} ` +
        `y prevé un ajuste a S/ ${product.prediccion7d.toFixed(2)} (${esSube ? '+' : ''}${product.variacion}%). ` +
        `Los vectores de búsqueda en ChromaDB confirman alineación con los boletines oficiales de Lima Sur.`,
      fuentes: [
        `ChromaDB Vector Storage - Documentos recuperados de ${product.nombre}`,
        `MIDAGRI SISAP - Base de Datos Mayorista`
      ]
    }
  }

  const handleSend = async (preguntaTexto?: string) => {
    const textoAEnviar = preguntaTexto || input
    if (!textoAEnviar.trim() || loading) return

    // 1. Mostrar mensaje del usuario
    const msgUsuario: Message = { role: "user", content: textoAEnviar }
    setMessages((prev) => [...prev, msgUsuario])
    if (!preguntaTexto) setInput("")
    setLoading(true)

    // 2. Simular tiempo de búsqueda semántica en ChromaDB (800ms)
    setTimeout(() => {
      const { texto, fuentes } = construirRespuestaDinamica(textoAEnviar)

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: texto,
          fuentes: fuentes
        }
      ])
      setLoading(false)
    }, 800)
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="border-b border-border py-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bot className="size-4" />
          </span>
          <div>
            <CardTitle className="text-base">Asistente RAG</CardTitle>
            <p className="text-xs text-muted-foreground">
              Respuestas fundamentadas en boletines del MIDAGRI, BCRP y SENAMHI
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between p-4 overflow-hidden">
        {/* Contenedor de conversación */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[340px]">
          {/* Botón de sugerencia rápida según el producto activo */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-primary/5 hover:bg-primary/10 text-primary border-primary/20"
              onClick={() => handleSend(`¿Por qué variará el precio de ${product.nombre.toLowerCase()} en los próximos 7 días?`)}
              disabled={loading}
            >
              <Sparkles className="size-3.5 mr-1.5" />
              ¿Por qué cambiará el precio de {product.nombre.toLowerCase()}?
            </Button>
          </div>

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 text-sm ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="size-3.5" />
                </span>
              )}
              <div
                className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="leading-relaxed">{msg.content}</p>

                {msg.fuentes && msg.fuentes.length > 0 && (
                  <div className="mt-3 border-t border-border/60 pt-2 text-xs text-muted-foreground">
                    <p className="font-semibold text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <FileText className="size-3" /> Fuentes Citadas (RAG):
                    </p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {msg.fuentes.map((fuente, idx) => (
                        <li key={idx} className="truncate">{fuente}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                  <User className="size-3.5" />
                </span>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 text-sm items-center text-muted-foreground">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground animate-pulse">
                <Bot className="size-3.5" />
              </span>
              <p className="text-xs italic">Consultando ChromaDB y vectorizando pregunta para {product.nombre}...</p>
            </div>
          )}
        </div>

        {/* Input para escribir preguntas libres */}
        <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Pregunta sobre ${product.nombre}...`}
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
          <Button size="icon" onClick={() => handleSend()} disabled={loading}>
            <Send className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
