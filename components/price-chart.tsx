"use client"

import { useMemo } from "react"
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { District, Product } from "@/lib/data"

const chartConfig = {
  historico: {
    label: "Precio histórico real",
    color: "var(--chart-1)",
  },
  prediccion: {
    label: "Predicción del ensamble",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export function PriceChart({
  product,
  district,
}: {
  product: Product
  district: District
}) {
  const data = useMemo(
    () =>
      product.serie.map((p) => ({
        date: p.date,
        historico:
          p.historico === null ? null : +(p.historico * district.factor).toFixed(2),
        prediccion:
          p.prediccion === null
            ? null
            : +(p.prediccion * district.factor).toFixed(2),
      })),
    [product.serie, district.factor],
  )

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-base">
            Precio histórico real vs. predicción del ensamble
          </CardTitle>
          <CardDescription>
            {product.nombre} · {product.unidad} · {district.nombre} · serie
            mensual 2020–2025
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-0.5 w-4 rounded bg-chart-1" aria-hidden="true" />
            Histórico real
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="h-0.5 w-4 rounded"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, var(--chart-4) 0 5px, transparent 5px 9px)",
              }}
              aria-hidden="true"
            />
            Predicción del ensamble
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[320px] w-full"
        >
          <ComposedChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
            <defs>
              <linearGradient id="fillHistorico" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-historico)"
                  stopOpacity={0.25}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-historico)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={40}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={48}
              domain={["auto", "auto"]}
              tickFormatter={(v) => `S/ ${Number(v).toFixed(1)}`}
            />
            <ReferenceLine
              x="Jun 25"
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{
                value: "Pronóstico",
                position: "insideTopRight",
                fill: "var(--muted-foreground)",
                fontSize: 11,
              }}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: "4 4" }}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <span className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label}
                      </span>
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        S/ {Number(value).toFixed(2)}
                      </span>
                    </span>
                  )}
                />
              }
            />
            <Area
              dataKey="historico"
              type="monotone"
              stroke="var(--color-historico)"
              strokeWidth={2.5}
              fill="url(#fillHistorico)"
              dot={false}
              connectNulls
            />
            <Line
              dataKey="prediccion"
              type="monotone"
              stroke="var(--color-prediccion)"
              strokeWidth={2}
              strokeDasharray="6 5"
              dot={false}
              connectNulls
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
