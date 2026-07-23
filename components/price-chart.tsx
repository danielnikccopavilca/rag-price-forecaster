"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
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
import type { Product } from "@/lib/data"

const chartConfig = {
  historico: {
    label: "Precio histórico",
    color: "var(--chart-1)",
  },
  prediccion: {
    label: "Predicción",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function PriceChart({ product }: { product: Product }) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base">
            Precio histórico vs. predicción
          </CardTitle>
          <CardDescription>
            {product.nombre} · {product.unidad} · últimos 14 días y horizonte de
            7 días
          </CardDescription>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-0.5 w-4 rounded bg-chart-1" aria-hidden="true" />
            Histórico
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="h-0.5 w-4 rounded bg-chart-2"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, var(--chart-2) 0 4px, transparent 4px 7px)",
                backgroundColor: "transparent",
              }}
              aria-hidden="true"
            />
            Predicción
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <LineChart data={product.serie} margin={{ left: 4, right: 12, top: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={44}
              domain={["auto", "auto"]}
              tickFormatter={(v) => `S/ ${Number(v).toFixed(1)}`}
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
            <Line
              dataKey="historico"
              type="monotone"
              stroke="var(--color-historico)"
              strokeWidth={2.5}
              dot={false}
              connectNulls
            />
            <Line
              dataKey="prediccion"
              type="monotone"
              stroke="var(--color-prediccion)"
              strokeWidth={2.5}
              strokeDasharray="6 5"
              dot={false}
              connectNulls
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
