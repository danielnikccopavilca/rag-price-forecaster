"""
Módulo 3: Ensamble Híbrido Predictivo (XGBoost + Prophet + BiLSTM + RAG)
Proyecto: Sistema de IA basado en RAG para Análisis Predictivo de Precios
Autor: Daniel Nik Ccopa Vilca
Escuela de Posgrado Newman
"""

import numpy as np


class HybridPredictiveEnsemble:

  def __init__(self, weights: dict = None):
    """Ensamble Híbrido basado en Combinación Lineal Ponderada.

    weights: Diccionario con los pesos relativos de cada modelo base.
    """
    # Pesos estándar definidos según la metodología de la tesis
    if weights is None:
      self.weights = {"xgboost": 0.40, "prophet": 0.35, "bilstm": 0.25}
    else:
      self.weights = weights

  def compute_ensemble_prediction(
      self,
      xgb_pred: float,
      prophet_pred: float,
      bilstm_pred: float,
      rag_context_score: float,
  ) -> float:
    """Calcula la predicción ponderada del ensamble cuantitativo

    y aplica el ajuste cualitativo derivado del RAG (boletines SENAMHI).
    """
    # 1. Combinación lineal ponderada de los modelos base
    base_prediction = (
        self.weights["xgboost"] * xgb_pred
        + self.weights["prophet"] * prophet_pred
        + self.weights["bilstm"] * bilstm_pred
    )

    # 2. Ajuste contextual por el impacto del RAG (ej. heladas/lluvias)
    adjusted_prediction = base_prediction * (1 + rag_context_score)

    return float(np.round(adjusted_prediction, 4))


if __name__ == "__main__":
  # Este bloque es solo una prueba local del script (no afecta la tesis)
  ensemble = HybridPredictiveEnsemble()

  pred_xgb = 0.82
  pred_prophet = 0.80
  pred_bilstm = 0.85
  rag_impact = (
      0.03  # 3% de impacto por factor climático recuperado de ChromaDB
  )

  final_price = ensemble.compute_ensemble_prediction(
      pred_xgb, pred_prophet, pred_bilstm, rag_impact
  )
  print(f"[PRUEBA UNITARIA A t+7] Precio Predicho: S/. {final_price}")