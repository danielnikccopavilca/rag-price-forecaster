export type ProductId =
  | "arroz"
  | "papa"
  | "cebolla"
  | "aceite"
  | "pollo"

export interface PricePoint {
  /** Etiqueta de fecha, ej. "12 Jun" */
  date: string
  /** Precio histórico observado (S/). Null en el tramo futuro. */
  historico: number | null
  /** Precio predicho por el modelo (S/). Null en el tramo pasado. */
  prediccion: number | null
}

export interface Citation {
  fuente: "MIDAGRI" | "BCRP"
  titulo: string
  codigo: string
  fecha: string
}

export interface Product {
  id: ProductId
  nombre: string
  unidad: string
  categoria: string
  precioActual: number
  /** Predicción a 7 días (S/) */
  prediccion7d: number
  /** Confianza del modelo 0-100 */
  confianza: number
  /** Variación % esperada en 7 días */
  variacion: number
  serie: PricePoint[]
  /** Respuesta del asistente RAG a "¿Por qué subirá / bajará?" */
  respuestaRag: string
  citas: Citation[]
}

/** Genera una serie de 21 días: 14 históricos + 7 de predicción con solape en el día 14. */
function buildSerie(
  base: number,
  drift: number,
  noise: number,
): PricePoint[] {
  const dias = [
    "12 May", "15 May", "18 May", "21 May", "24 May", "27 May", "30 May",
    "02 Jun", "05 Jun", "08 Jun", "11 Jun", "14 Jun", "17 Jun", "20 Jun",
    "23 Jun", "26 Jun", "29 Jun", "02 Jul", "05 Jul", "08 Jul", "11 Jul",
  ]
  const splitIndex = 13 // el día 14 es el punto de empalme
  return dias.map((date, i) => {
    const wave = Math.sin(i / 2.2) * noise
    const value = +(base + drift * i + wave).toFixed(2)
    if (i < splitIndex) {
      return { date, historico: value, prediccion: null }
    }
    if (i === splitIndex) {
      return { date, historico: value, prediccion: value }
    }
    return { date, historico: null, prediccion: value }
  })
}

export const PRODUCTS: Product[] = [
  {
    id: "arroz",
    nombre: "Arroz Corriente",
    unidad: "S/ / kg",
    categoria: "Granos",
    precioActual: 4.35,
    prediccion7d: 4.28,
    confianza: 91,
    variacion: -1.6,
    serie: buildSerie(4.1, 0.02, 0.06),
    respuestaRag:
      "El arroz corriente muestra una ligera tendencia a la baja para los próximos 7 días. La campaña grande de la costa norte (Lambayeque y Piura) incrementó la oferta en los mercados mayoristas, presionando los precios a la baja. El modelo XGBoost+LSTM proyecta una caída moderada de -1.6%, consistente con la estacionalidad post-cosecha.",
    citas: [
      {
        fuente: "MIDAGRI",
        titulo: "Boletín de Abastecimiento y Precios Mayoristas de Arroz",
        codigo: "SISAP-ARZ-062",
        fecha: "Junio 2025",
      },
      {
        fuente: "BCRP",
        titulo: "Reporte de Inflación — Alimentos y Energía",
        codigo: "RI-2025-02",
        fecha: "Junio 2025",
      },
    ],
  },
  {
    id: "papa",
    nombre: "Papa Blanca",
    unidad: "S/ / kg",
    categoria: "Tubérculos",
    precioActual: 2.1,
    prediccion7d: 2.34,
    confianza: 87,
    variacion: 11.4,
    serie: buildSerie(1.85, 0.03, 0.09),
    respuestaRag:
      "La papa blanca presenta presión al alza. Las heladas registradas en las zonas productoras de la sierra central (Junín y Huánuco) redujeron el ingreso de camiones al Gran Mercado Mayorista de Lima. El modelo anticipa un incremento de +11.4% impulsado por la menor oferta estacional y el aumento de costos de transporte.",
    citas: [
      {
        fuente: "MIDAGRI",
        titulo: "Reporte de Ingreso de Papa al Mercado Mayorista de Lima",
        codigo: "SISAP-PAP-058",
        fecha: "Junio 2025",
      },
      {
        fuente: "BCRP",
        titulo: "Notas de Estudios — Choques de oferta agrícola",
        codigo: "NE-2025-41",
        fecha: "Junio 2025",
      },
    ],
  },
  {
    id: "cebolla",
    nombre: "Cebolla Roja",
    unidad: "S/ / kg",
    categoria: "Hortalizas",
    precioActual: 3.2,
    prediccion7d: 3.05,
    confianza: 84,
    variacion: -4.7,
    serie: buildSerie(3.35, -0.015, 0.08),
    respuestaRag:
      "La cebolla roja tiende a la baja. La producción de Arequipa (principal región proveedora) mantiene niveles altos y el clima favorable aceleró la cosecha, generando sobreoferta temporal. El modelo estima una reducción de -4.7% para la próxima semana.",
    citas: [
      {
        fuente: "MIDAGRI",
        titulo: "Boletín Regional de Cebolla — Arequipa",
        codigo: "SISAP-CEB-044",
        fecha: "Junio 2025",
      },
    ],
  },
  {
    id: "aceite",
    nombre: "Aceite Vegetal 1L",
    unidad: "S/ / L",
    categoria: "Abarrotes",
    precioActual: 8.9,
    prediccion7d: 9.15,
    confianza: 89,
    variacion: 2.8,
    serie: buildSerie(8.4, 0.028, 0.05),
    respuestaRag:
      "El aceite vegetal muestra tendencia al alza moderada. El incremento del precio internacional del aceite de soya y de palma, sumado a la variación del tipo de cambio, se traslada gradualmente al precio local. El modelo proyecta +2.8% en línea con los precios de importación reportados.",
    citas: [
      {
        fuente: "BCRP",
        titulo: "Precios de Commodities — Aceites y Oleaginosas",
        codigo: "BCRP-COMM-2025-06",
        fecha: "Junio 2025",
      },
      {
        fuente: "MIDAGRI",
        titulo: "Seguimiento de Precios de Aceites Vegetales",
        codigo: "SISAP-ACT-031",
        fecha: "Junio 2025",
      },
    ],
  },
  {
    id: "pollo",
    nombre: "Pollo Entero",
    unidad: "S/ / kg",
    categoria: "Cárnicos",
    precioActual: 8.6,
    prediccion7d: 9.42,
    confianza: 93,
    variacion: 9.5,
    serie: buildSerie(7.9, 0.045, 0.12),
    respuestaRag:
      "El pollo entero subirá aproximadamente +9.5% en los próximos 7 días. El precio del maíz amarillo duro —principal insumo del alimento balanceado— aumentó por menor disponibilidad importada, elevando los costos de crianza. Además, el modelo detecta un patrón estacional de mayor demanda de fin de mes que presiona el precio al alza en el Mercado Mayorista de Aves.",
    citas: [
      {
        fuente: "MIDAGRI",
        titulo: "Boletín de Comercialización de Aves y Maíz Amarillo Duro",
        codigo: "SISAP-AVE-071",
        fecha: "Junio 2025",
      },
      {
        fuente: "BCRP",
        titulo: "Reporte de Inflación — Alimentos y Energía",
        codigo: "RI-2025-02",
        fecha: "Junio 2025",
      },
    ],
  },
]

export function getProduct(id: ProductId): Product {
  return PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0]
}
