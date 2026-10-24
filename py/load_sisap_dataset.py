"""
Módulo 1: Ingesta y Unificación Multivariada (SISAP Precios/Volúmenes + SBS Venta)
Proyecto: Sistema de IA basado en RAG para Análisis Predictivo de Precios
Autor: Daniel Nik Ccopa Vilca
Escuela de Posgrado Newman
"""

import os
import numpy as np
import pandas as pd


class SISAPDataProcessor:

  def __init__(
      self,
      sisap_path="data/reporteProductos_2020_2025.xls",
      sbs_path="data/ReporteTipoDeCambioSBS_2020_2025.xls",
  ):
    # 📌 CAMBIO: Ahora apunta automáticamente a la subcarpeta 'data/'
    self.sisap_path = sisap_path
    self.sbs_path = sbs_path

  def load_and_clean_data(self):
    """Lee el reporte multicabecera del SISAP (Precios y Volúmenes) y el reporte de la SBS (Tipo de Cambio Venta),

    unificando las series de tiempo de forma limpia.
    """
    print(f"[INFO] Cargando reporte SISAP desde: {self.sisap_path}...")
    if not os.path.exists(self.sisap_path):
      raise FileNotFoundError(f"No se encontró el archivo {self.sisap_path}")

    # 1. Lectura del dataset SISAP
    df_list_sisap = pd.read_html(self.sisap_path)
    df_raw_sisap = df_list_sisap[0]

    # Mapeo de cabecera multinivel (Fila 0 = Producto, Fila 1 = Variable)
    products = df_raw_sisap.iloc[0].values
    subheaders = df_raw_sisap.iloc[1].values

    new_columns = []
    for p, s in zip(products, subheaders):
      if str(p).strip().lower() == "fecha":
        new_columns.append("fecha")
      else:
        # Estandarizamos el nombre corto del producto
        p_str = str(p)
        if "Aceite" in p_str:
          prod = "aceite"
        elif "Arroz" in p_str:
          prod = "arroz"
        elif "Cebolla" in p_str:
          prod = "cebolla"
        elif "Papa" in p_str:
          prod = "papa"
        elif "Pollo" in p_str:
          prod = "pollo"
        else:
          prod = "producto"

        # Subcolumna (Precio o Volumen)
        s_str = str(s)
        if "Precio" in s_str:
          new_columns.append(f"{prod}_precio")
        elif "Volumen" in s_str:
          new_columns.append(f"{prod}_volumen")
        else:
          new_columns.append(f"{prod}_val")

    # Aplicar nuevas columnas y extraer registros
    df_sisap = df_raw_sisap.iloc[2:].copy()
    df_sisap.columns = new_columns

    # Convertir columna de fecha
    df_sisap["fecha"] = pd.to_datetime(
        df_sisap["fecha"], format="%d/%m/%Y", errors="coerce"
    )
    df_sisap = df_sisap.sort_values("fecha").reset_index(drop=True)

    # Limpieza e imputación de numéricos ('...' por NaN)
    for col in df_sisap.columns:
      if col != "fecha":
        df_sisap[col] = (
            df_sisap[col].astype(str).str.replace("...", "", regex=False)
        )
        df_sisap[col] = pd.to_numeric(df_sisap[col], errors="coerce")

        # Si una columna completa no tiene datos (ej. volumen de aceite/pollo), colocar 0.0
        if df_sisap[col].isna().all():
          df_sisap[col] = 0.0
        else:
          df_sisap[col] = df_sisap[col].ffill().bfill()

    # 2. Lectura e integración del Tipo de Cambio VENTA de la SBS
    if os.path.exists(self.sbs_path):
      print(
          f"[INFO] Integrando Tipo de Cambio VENTA de la SBS desde:"
          f" {self.sbs_path}..."
      )
      df_list_sbs = pd.read_html(self.sbs_path)
      df_sbs_raw = df_list_sbs[0]

      df_sbs_raw.columns = df_sbs_raw.iloc[0]
      df_sbs = df_sbs_raw.iloc[1:].copy()

      df_sbs["fecha"] = pd.to_datetime(
          df_sbs["FECHA"], format="%d/%m/%Y", errors="coerce"
      )
      df_sbs["tc_venta_sbs"] = pd.to_numeric(
          df_sbs["VENTA"], errors="coerce"
      )

      df_sbs_clean = (
          df_sbs[["fecha", "tc_venta_sbs"]]
          .sort_values("fecha")
          .dropna(subset=["fecha"])
      )

      df_sisap = pd.merge(df_sisap, df_sbs_clean, on="fecha", how="left")
      df_sisap["tc_venta_sbs"] = df_sisap["tc_venta_sbs"].ffill().bfill()
      print(
          "[SUCCESS] Tipo de Cambio VENTA de la SBS integrado exitosamente."
      )
    else:
      print(
          "[WARNING] No se encontró el archivo de la SBS en la carpeta 'data/'."
          " Se continuará solo con datos del SISAP."
      )

    print(
        f"[SUCCESS] Ingesta multivariada completada: {len(df_sisap)} registros"
        " diarios (2020-2025)."
    )
    return df_sisap


if __name__ == "__main__":
  processor = SISAPDataProcessor()
  df_clean = processor.load_and_clean_data()
  print(df_clean.head())
