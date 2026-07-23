"use client"

import {
  BookOpen,
  Code2,
  LineChart,
  MapPin,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import {
  DISTRICTS,
  PRODUCTS,
  type DistrictId,
  type Product,
  type ProductId,
} from "@/lib/data"
import { cn } from "@/lib/utils"

interface ProductSidebarProps {
  selected: ProductId
  onSelect: (id: ProductId) => void
  district: DistrictId
  onDistrictChange: (id: DistrictId) => void
}

export function ProductSidebar({
  selected,
  onSelect,
  district,
  onDistrictChange,
}: ProductSidebarProps) {
  return (
    <aside className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground md:w-72">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="flex size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <LineChart className="size-5" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-sidebar-foreground">
            RAG Price Forecaster
          </p>
          <p className="text-xs text-sidebar-foreground/60">Lima Sur · Perú</p>
        </div>
      </div>

      <div className="border-b border-sidebar-border px-5 py-4">
        <label className="flex items-center gap-1.5 pb-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
          <MapPin className="size-3.5" aria-hidden="true" />
          Distrito / zona
        </label>
        <div
          className="grid grid-cols-2 gap-1 rounded-lg bg-sidebar-accent/60 p-1"
          role="group"
          aria-label="Selector de distrito"
        >
          {DISTRICTS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onDistrictChange(d.id)}
              aria-pressed={district === d.id}
              className={cn(
                "rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                district === d.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
              )}
            >
              {d.nombre}
            </button>
          ))}
        </div>
      </div>

      <nav aria-label="Productos" className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
          Producto en análisis
        </p>
        <ul className="flex flex-col gap-1">
          {PRODUCTS.map((product) => (
            <li key={product.id}>
              <ProductButton
                product={product}
                active={product.id === selected}
                onClick={() => onSelect(product.id)}
              />
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-1 border-t border-sidebar-border px-3 py-3">
        <SidebarLink
          href="https://github.com"
          icon={<Code2 className="size-4" aria-hidden="true" />}
          label="Repositorio en GitHub"
        />
        <SidebarLink
          href="https://github.com"
          icon={<BookOpen className="size-4" aria-hidden="true" />}
          label="Documentación de la tesis"
        />
      </div>

      <div className="border-t border-sidebar-border px-5 py-4">
        <p className="text-xs leading-relaxed text-sidebar-foreground/60">
          Ensamble{" "}
          <span className="font-medium text-sidebar-foreground/90">
            XGBoost + LSTM
          </span>{" "}
          con recuperación aumentada (RAG) sobre boletines del MIDAGRI, BCRP y
          SENAMHI.
        </p>
      </div>
    </aside>
  )
}

function SidebarLink({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      {icon}
      {label}
    </a>
  )
}

function ProductButton({
  product,
  active,
  onClick,
}: {
  product: Product
  active: boolean
  onClick: () => void
}) {
  const isUp = product.variacion >= 0
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <span className="flex flex-col">
        <span className="text-sm font-medium">{product.nombre}</span>
        <span
          className={cn(
            "text-xs",
            active
              ? "text-sidebar-primary-foreground/70"
              : "text-sidebar-foreground/50",
          )}
        >
          {product.categoria}
        </span>
      </span>
      <span
        className={cn(
          "flex items-center gap-1 text-xs font-semibold tabular-nums",
          active
            ? "text-sidebar-primary-foreground"
            : isUp
              ? "text-chart-5"
              : "text-chart-3",
        )}
      >
        {isUp ? (
          <TrendingUp className="size-3.5" aria-hidden="true" />
        ) : (
          <TrendingDown className="size-3.5" aria-hidden="true" />
        )}
        {isUp ? "+" : ""}
        {product.variacion.toFixed(1)}%
      </span>
    </button>
  )
}
