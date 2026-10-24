"use client"

import { Bot, FileText, Database, ShieldCheck, ExternalLink, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Product } from "@/lib/data"

export function RagChat({ product }: { product: Product }) {
  // Fuentes documentales oficiales con sus URLs reales de origen
  const fuentesRAG = [
    {
      institucion: "MIDAGRI SISAP",
      tipo: "Reporte de Abastecimiento y Precios",
      referencia: `Ref. SISAP-${product.id.toUpperCase()}-2026`,
      detalle: `Monitoreo diario de ingresos al Mercado Mayorista de Santa Anita para ${product.nombre}.`,
      url: "http://sistemas.midagri.gob.pe/sisap/portal2/mayorista/resumenes/consultar/#"
    },
    {
      institucion: "SENAMHI",
      tipo: "Alerta Agrometeorológica y Lluvias",
      referencia: "Boletines Agrometeorológicos 2020-2025",
      detalle: "Evaluación de condiciones térmicas, precipitaciones e impacto en valles abastecedores.",
      url: "https://www.gob.pe/institucion/senamhi/buscador?contenido=publicaciones&institucion=senamhi&sheet=1&sort_by=none&term=%20BOLETIN%20DE%20LLUVIAS%202020"
    },
    {
      institucion: "BCRP / SBS",
      tipo: "Tipo de Cambio Histórico",
      referencia: "Series Cambiarias USD/PEN",
      detalle: "Análisis de incidencia macroeconómica y costos de importación de insumos agrícolas.",
      url: "https://www.sbs.gob.pe/app/stats/seriesH_TC-CV-Historico.asp"
    }
  ]

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="border-b border-border py-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bot className="size-4" />
          </span>
          <div>
            <CardTitle className="text-base">Módulo RAG & Explicabilidad</CardTitle>
            <p className="text-xs text-muted-foreground">
              Recuperación semántica vectorial en ChromaDB (HNSW, k=5)
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between p-4 space-y-4 overflow-y-auto max-h-[500px]">
        
        {/* Bloque de Métricas del Dataset (Tesis: 10,950 observaciones y 1,420 docs) */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-primary/5 p-2.5 border border-primary/20 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-primary mb-0.5">
              <BarChart3 className="size-3.5" /> Series Temporales
            </div>
            <p className="text-sm font-bold text-foreground">10,950 obs.</p>
            <p className="text-[10px] text-muted-foreground">5 prod. × 365 días × 6 años</p>
          </div>
          <div className="rounded-lg bg-primary/5 p-2.5 border border-primary/20 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-primary mb-0.5">
              <Database className="size-3.5" /> Corpus RAG
            </div>
            <p className="text-sm font-bold text-foreground">1,420 docs.</p>
            <p className="text-[10px] text-muted-foreground">Indexados en ChromaDB</p>
          </div>
        </div>

        {/* Resumen del Contexto Recuperado para el Producto Activo */}
        <div className="rounded-xl bg-muted/60 p-3 border border-border">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-1">
            <ShieldCheck className="size-4" />
            <span>Contexto Recuperado para {product.nombre} (t+7)</span>
          </div>
          <p className="text-xs text-foreground/90 leading-relaxed">
            {product.respuestaRag || `El motor vectorial identifica estabilidad en los flujos de ingreso mayorista. El ensamble híbrido (XGBoost + Prophet + BiLSTM) proyecta S/ ${product.prediccion7d.toFixed(2)} (${product.variacion >= 0 ? '+' : ''}${product.variacion}%) fundamentado en los reportes institucionales indexados.`}
          </p>
        </div>

        {/* Listado de Fuentes Documentales con Enlaces a las Webs Oficiales */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
            <FileText className="size-3.5" /> Trazabilidad de Fuentes Oficiales
          </p>
          
          <div className="space-y-2">
            {fuentesRAG.map((fuente, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-card p-2.5 text-xs shadow-2xs hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-primary px-1.5 py-0.5 rounded bg-primary/10 text-[11px]">
                    {fuente.institucion}
                  </span>
                  <a 
                    href={fuente.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                  >
                    Ver Fuente <ExternalLink className="size-3" />
                  </a>
                </div>
                <p className="font-medium text-foreground mb-0.5">
                  {fuente.tipo}
                </p>
                <p className="text-muted-foreground text-[11px] leading-tight">
                  {fuente.detalle}
                </p>
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
