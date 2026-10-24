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

  // Reiniciar chat al cambiar de producto
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: product.respuestaRag || `Asistente RAG activo para ${product.nombre}. Haz cualquier pregunta sobre la variación proyectada del precio, clima o abastecimiento.`,
        fuentes: [
          `Boletín MIDAGRI SISAP - ${product.nombre}`,
          "Notas de Estudios BCRP"
        ]
      }
    ])
  }, [product.id, product.nombre, product.respuestaRag])

  const handleSend = async (preguntaTexto?: string) => {
    const textoAEnviar = preguntaTexto || input
    if (!textoAEnviar.trim() || loading) return

    // 1. Agregar mensaje del usuario
    const userMessage: Message = { role: "user", content: textoAEnviar }
    setMessages((prev) => [...prev, userMessage])
    if (!preguntaTexto) setInput("")
    setLoading(true)

    try {
      // 2. Consulta 100% REAL a la API en Render enviando el producto y la pregunta del usuario
      const res = await fetch(
        `https://rag-price-forecaster-api.onrender.com/api/rag-chat?producto=${encodeURIComponent(product.nombre)}&query=${encodeURIComponent(textoAEnviar)}`
      )
      
      if (res.ok) {
        const data = await res.json()
        
        // 3. Mostrar la respuesta real devuelta por el motor RAG/LLM del servidor
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.respuesta,
            fuentes: data.fuentes || []
          }
        ])
      } else {
        throw new Error("Error en la respuesta del servidor RAG")
      }
    } catch (error) {
      console.error("Error al conectar con el motor RAG de Render:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Ocurrió un inconveniente al consultar el servidor RAG para ${product.nombre}. Por favor reintenta en unos instantes.`,
          fuentes: []
        }
      ])
    } finally {
      setLoading(false)
    }
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
              Respuestas dinámicas fundamentadas en ChromaDB, MIDAGRI y BCRP
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between p-4 overflow-hidden">
        {/* Contenedor de mensajes */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[340px]">
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
              <p className="text-xs italic">Buscando vectores en ChromaDB y generando respuesta...</p>
            </div>
          )}
        </div>

        {/* Input para preguntas libres */}
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
