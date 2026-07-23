export type ProductId =
  | "arroz"
  | "papa"
  | "cebolla"
  | "aceite"
  | "pollo"

export type SourceName = "MIDAGRI" | "BCRP" | "SENAMHI"

export interface PricePoint {
  /** Etiqueta temporal, ej. "Ene 20" */
  date: string
  /** Precio histórico real observado (S/). Null en el tramo de pronóstico futuro. */
  historico: number | null
  /** Precio estimado por el ensamble XGBoost+LSTM (S/). */
  prediccion: number | null
}

export interface Citation {
  fuente: SourceName
  titulo: string
  codigo: string
  fecha: string
  /** Fragmento textual recuperado por el pipeline RAG. */
  extracto: string
}

export interface District {
  id: DistrictId
  nombre: string
  /** Factor multiplicador de precio respecto de la línea base Lima Sur. */
  factor: number
}

export type DistrictId = "lima-sur" | "chorrillos"

export const DISTRICTS: District[] = [
  { id: "lima-sur", nombre: "Lima Sur", factor: 1 },
  { id: "chorrillos", nombre: "Chorrillos", factor: 1.035 },
]

export interface Product {
  id: ProductId
  nombre: string
  unidad: string
  categoria: string
  /** Precio mayorista actual (S/) — línea base Lima Sur. */
  precioActual: number
  /** Predicción a 7 días (S/) — línea base Lima Sur. */
  prediccion7d: number
  /** Confianza del ensamble 0-100. */
  confianza: number
  /** Variación % esperada en 7 días. */
  variacion: number
  serie: PricePoint[]
  /** Respuesta del asistente RAG a la pregunta sobre factores de variación. */
  respuestaRag: string
  citas: Citation[]
}

const MONTHS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
]

/**
 * Genera una serie mensual de Ene-2020 a Dic-2025 (72 puntos).
 * `historico` cubre datos reales hasta Jun-2025; `prediccion` es el ajuste
 * del ensamble a lo largo de todo el periodo y continúa como pronóstico
 * hasta Dic-2025.
 */
function buildSerie(
  base: number,
  trendPorAnio: number,
  amplitudEstacional: number,
  ruido: number,
): PricePoint[] {
  const startYear = 2020
  const totalMonths = 72
  const histEnd = 65 // Jun-2025
  const points: PricePoint[] = []
  for (let i = 0; i < totalMonths; i++) {
    const year = startYear + Math.floor(i / 12)
    const month = i % 12
    const t = i / 12
    const estacional = Math.sin((month / 12) * Math.PI * 2) * amplitudEstacional
    const tendencia = trendPorAnio * t
    const ondulacion = Math.sin(i / 3.1) * ruido
    const real = +(base + tendencia + estacional + ondulacion).toFixed(2)
    const desvioModelo = Math.cos(i / 2.4) * ruido * 0.45
    const pred = +(real + desvioModelo).toFixed(2)
    points.push({
      date: `${MONTHS[month]} ${String(year).slice(2)}`,
      historico: i <= histEnd ? real : null,
      prediccion: pred,
    })
  }
  return points
}

export const PRODUCTS: Product[] = [
  {
    id: "papa",
    nombre: "Papa Blanca",
    unidad: "S/ / kg",
    categoria: "Tubérculos",
    precioActual: 3.15,
    prediccion7d: 3.2,
    confianza: 94.2,
    variacion: 1.5,
    serie: buildSerie(2.35, 0.16, 0.28, 0.16),
    respuestaRag:
      "La variación del precio de la Papa Blanca en Lima Sur se explica principalmente por tres factores. Primero, las heladas y el déficit de lluvias reportados en la sierra central (Junín y Huánuco) por el SENAMHI redujeron el rendimiento por hectárea y el ingreso de camiones al Gran Mercado Mayorista. Segundo, el MIDAGRI registró una caída del abastecimiento semanal frente al promedio del mes anterior. Tercero, el BCRP asocia esta presión a un componente estacional de oferta agrícola. El ensamble XGBoost+LSTM integra estas señales climáticas y de mercado y proyecta un alza moderada de +1.5% a 7 días.",
    citas: [
      {
        fuente: "SENAMHI",
        titulo: "Boletín Agrometeorológico Decadal — Sierra Central",
        codigo: "SENAMHI-AGM-2025-17",
        fecha: "Junio 2025",
        extracto:
          "Se registraron heladas de hasta -4 °C en zonas altoandinas de Junín y Huánuco, con déficit de precipitación del 22% respecto del promedio decadal, afectando el desarrollo del cultivo de papa.",
      },
      {
        fuente: "MIDAGRI",
        titulo: "Reporte de Ingreso de Papa al Mercado Mayorista de Lima",
        codigo: "SISAP-PAP-058",
        fecha: "Junio 2025",
        extracto:
          "El ingreso semanal de papa blanca descendió 9% respecto de la semana previa, con menor procedencia de la sierra central por dificultades de transporte.",
      },
      {
        fuente: "BCRP",
        titulo: "Notas de Estudios — Choques de oferta agrícola",
        codigo: "NE-2025-41",
        fecha: "Junio 2025",
        extracto:
          "Los choques de oferta de origen climático explican gran parte de la volatilidad de precios de tubérculos en el corto plazo.",
      },
    ],
  },
  {
    id: "arroz",
    nombre: "Arroz Corriente",
    unidad: "S/ / kg",
    categoria: "Granos",
    precioActual: 4.35,
    prediccion7d: 4.28,
    confianza: 91.3,
    variacion: -1.6,
    serie: buildSerie(3.5, 0.14, 0.12, 0.1),
    respuestaRag:
      "El precio del Arroz Corriente muestra una leve tendencia a la baja explicada por la mayor oferta de la campaña grande de la costa norte (Lambayeque y Piura). El SENAMHI reporta condiciones térmicas favorables que adelantaron la cosecha, el MIDAGRI confirma un mayor abastecimiento mayorista y el BCRP ubica el precio dentro de su rango estacional post-cosecha. El ensamble XGBoost+LSTM proyecta una caída moderada de -1.6% a 7 días.",
    citas: [
      {
        fuente: "SENAMHI",
        titulo: "Boletín Agrometeorológico — Costa Norte",
        codigo: "SENAMHI-AGM-2025-15",
        fecha: "Junio 2025",
        extracto:
          "Temperaturas dentro de lo normal y ausencia de anomalías hídricas favorecieron el llenado de grano y el avance de cosecha de arroz en Lambayeque y Piura.",
      },
      {
        fuente: "MIDAGRI",
        titulo: "Boletín de Abastecimiento y Precios Mayoristas de Arroz",
        codigo: "SISAP-ARZ-062",
        fecha: "Junio 2025",
        extracto:
          "El abastecimiento de arroz pilado al mercado mayorista aumentó por el ingreso de la campaña grande, presionando los precios a la baja.",
      },
      {
        fuente: "BCRP",
        titulo: "Reporte de Inflación — Alimentos y Energía",
        codigo: "RI-2025-02",
        fecha: "Junio 2025",
        extracto:
          "Los precios de granos básicos se mantienen dentro del rango estacional esperado para el segundo trimestre.",
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
    confianza: 88.7,
    variacion: -4.7,
    serie: buildSerie(2.9, 0.1, 0.34, 0.18),
    respuestaRag:
      "La Cebolla Roja tiende a la baja por la sobreoferta temporal desde Arequipa, principal región proveedora. El SENAMHI reporta clima seco y estable que aceleró la cosecha, el MIDAGRI observa un aumento del volumen ingresado al mercado y el BCRP no identifica presiones inflacionarias en hortalizas. El ensamble XGBoost+LSTM estima una reducción de -4.7% a 7 días.",
    citas: [
      {
        fuente: "SENAMHI",
        titulo: "Boletín Agrometeorológico — Región Arequipa",
        codigo: "SENAMHI-AGM-2025-16",
        fecha: "Junio 2025",
        extracto:
          "Condiciones de baja humedad y cielo despejado favorecieron la maduración y cosecha anticipada de cebolla en los valles arequipeños.",
      },
      {
        fuente: "MIDAGRI",
        titulo: "Boletín Regional de Cebolla — Arequipa",
        codigo: "SISAP-CEB-044",
        fecha: "Junio 2025",
        extracto:
          "El volumen ingresado de cebolla roja creció frente al promedio mensual, generando una sobreoferta que reduce los precios de referencia.",
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
    confianza: 89.4,
    variacion: 2.8,
    serie: buildSerie(7.2, 0.42, 0.18, 0.14),
    respuestaRag:
      "El Aceite Vegetal 1L presenta un alza moderada asociada a factores importados más que climáticos locales. El BCRP reporta un incremento del precio internacional del aceite de soya y palma junto con la variación del tipo de cambio, mientras el MIDAGRI registra el traslado gradual al precio local. El SENAMHI no reporta afectaciones relevantes a oleaginosas nacionales. El ensamble XGBoost+LSTM proyecta +2.8% a 7 días.",
    citas: [
      {
        fuente: "BCRP",
        titulo: "Precios de Commodities — Aceites y Oleaginosas",
        codigo: "BCRP-COMM-2025-06",
        fecha: "Junio 2025",
        extracto:
          "El precio internacional del aceite de soya subió 3.1% mensual y el de palma 2.4%, con impacto en los costos de importación del aceite vegetal.",
      },
      {
        fuente: "MIDAGRI",
        titulo: "Seguimiento de Precios de Aceites Vegetales",
        codigo: "SISAP-ACT-031",
        fecha: "Junio 2025",
        extracto:
          "El precio minorista y mayorista del aceite vegetal reflejó con rezago el incremento de los precios internacionales de las oleaginosas.",
      },
      {
        fuente: "SENAMHI",
        titulo: "Monitoreo Agroclimático Nacional",
        codigo: "SENAMHI-AGM-2025-14",
        fecha: "Junio 2025",
        extracto:
          "No se registran anomalías climáticas significativas que afecten la producción de cultivos oleaginosos a nivel nacional.",
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
    confianza: 93.1,
    variacion: 9.5,
    serie: buildSerie(7.0, 0.32, 0.22, 0.26),
    respuestaRag:
      "El Pollo Entero subirá cerca de +9.5% a 7 días. El BCRP reporta el encarecimiento del maíz amarillo duro importado, principal insumo del alimento balanceado, elevando el costo de crianza. El MIDAGRI detecta un patrón estacional de mayor demanda de fin de mes en el Mercado Mayorista de Aves, y el SENAMHI registra olas de calor que afectan la conversión alimenticia de las aves. El ensamble XGBoost+LSTM integra estos factores y proyecta un alza significativa.",
    citas: [
      {
        fuente: "MIDAGRI",
        titulo: "Boletín de Comercialización de Aves y Maíz Amarillo Duro",
        codigo: "SISAP-AVE-071",
        fecha: "Junio 2025",
        extracto:
          "La demanda de pollo mostró su patrón estacional de incremento hacia fin de mes, con menor colocación de aves en el mercado mayorista.",
      },
      {
        fuente: "BCRP",
        titulo: "Reporte de Inflación — Alimentos y Energía",
        codigo: "RI-2025-02",
        fecha: "Junio 2025",
        extracto:
          "El alza del maíz amarillo duro importado incrementa los costos del alimento balanceado y presiona el precio de la carne de ave.",
      },
      {
        fuente: "SENAMHI",
        titulo: "Aviso Agrometeorológico — Costa Central",
        codigo: "SENAMHI-AGM-2025-18",
        fecha: "Junio 2025",
        extracto:
          "Se prevén temperaturas máximas por encima de lo normal en la costa central, condición que reduce la conversión alimenticia en granjas avícolas.",
      },
    ],
  },
]

export function getProduct(id: ProductId): Product {
  return PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0]
}

export function getDistrict(id: DistrictId): District {
  return DISTRICTS.find((d) => d.id === id) ?? DISTRICTS[0]
}
