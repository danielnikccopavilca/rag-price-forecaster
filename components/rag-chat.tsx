"use client"

import { useEffect, useRef, useState } from "react"
import { FileText, Search, Send, Sparkles } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Citation, Product } from "@/lib/data"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  text: string
  citations?: Citation[]
}

export function RagChat({ product }: { product: Product }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [thinking, setThinking] = useState(false)
  const composing = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const suggestion = `¿Por qué ${
    product.variacion >= 0 ? "subirá" : "bajará"
  } ${
    product.nombre === "Pollo Entero"
      ? "el pollo"
      : `la ${product.nombre.toLowerCase()}`
  }?`

  // Reinicia la conversación al cambiar de producto.
  useEffect(() => {
    setMessages([])
    setInput("")
    setThinking(false)
  }, [product.id])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, thinking])

  function ask(question: string) {
    const q = question.trim()
    if (!q || thinking) return
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text: q,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setThinking(true)

    // Simula la recuperación + generación del pipeline RAG.
    window.setTimeout(() => {
      const answer: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: product.respuestaRag,
        citations: product.citas,
      }
      setMessages((prev) => [...prev, answer])
      setThinking(false)
    }, 1100)
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center gap-3 border-b">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-4.5" aria-hidden="true" />
        </span>
        <div>
          <CardTitle className="text-base">Asistente RAG</CardTitle>
          <CardDescription>
            Respuestas fundamentadas en boletines del MIDAGRI y BCRP
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden pt-4">
        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto pr-1"
          aria-live="polite"
        >
          {messages.length === 0 && !thinking && (
            <EmptyState suggestion={suggestion} onPick={ask} />
          )}

          {messages.map((m) =>
            m.role === "user" ? (
              <UserBubble key={m.id} text={m.text} />
            ) : (
              <AssistantBubble key={m.id} text={m.text} citations={m.citations} />
            ),
          )}

          {thinking && <ThinkingBubble />}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            ask(input)
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onCompositionStart={() => (composing.current = true)}
              onCompositionEnd={() => (composing.current = false)}
              placeholder={`Pregunta sobre ${product.nombre}...`}
              aria-label="Escribe tu pregunta al asistente RAG"
              className="pl-9"
            />
          </div>
          <Button type="submit" size="icon" disabled={!input.trim() || thinking}>
            <Send className="size-4" aria-hidden="true" />
            <span className="sr-only">Enviar pregunta</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function EmptyState({
  suggestion,
  onPick,
}: {
  suggestion: string
  onPick: (q: string) => void
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border bg-muted/40 p-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Hazle una pregunta al modelo sobre la tendencia del precio. El sistema
        recupera fragmentos de boletines oficiales y genera una explicación
        citando la fuente.
      </p>
      <button
        type="button"
        onClick={() => onPick(suggestion)}
        className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
      >
        {suggestion}
      </button>
    </div>
  )
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
        {text}
      </p>
    </div>
  )
}

function AssistantBubble({
  text,
  citations,
}: {
  text: string
  citations?: Citation[]
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="max-w-[92%] rounded-2xl rounded-bl-sm bg-muted px-4 py-3 text-sm leading-relaxed text-foreground">
        {text}
      </div>
      {citations && citations.length > 0 && (
        <div className="flex flex-col gap-2 pl-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Fuentes citadas
          </p>
          {citations.map((c) => (
            <CitationCard key={c.codigo} citation={c} />
          ))}
        </div>
      )}
    </div>
  )
}

function CitationCard({ citation }: { citation: Citation }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
        <FileText className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide",
              citation.fuente === "MIDAGRI"
                ? "bg-chart-3/15 text-chart-3"
                : "bg-primary/10 text-primary",
            )}
          >
            {citation.fuente}
          </span>
          <span className="text-xs text-muted-foreground">{citation.fecha}</span>
        </div>
        <p className="mt-1 text-sm font-medium text-foreground leading-snug">
          {citation.titulo}
        </p>
        <p className="text-xs text-muted-foreground">Ref. {citation.codigo}</p>
      </div>
    </div>
  )
}

function ThinkingBubble() {
  return (
    <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
      <span className="flex gap-1" aria-hidden="true">
        <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
        <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
        <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60" />
      </span>
      <span className="text-xs text-muted-foreground">
        Recuperando boletines y generando respuesta...
      </span>
    </div>
  )
}
