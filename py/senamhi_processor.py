import os
from pypdf import PdfReader


class SENAMHIProcessor:

  def __init__(self, rag_store, pdf_folder: str = "boletines_senamhi"):
    """Procesador para extraer texto de los boletines PDF del SENAMHI

     e ingresarlos al RAG Vector Store.
    """
    self.rag_store = rag_store
    self.pdf_folder = pdf_folder

  def procesar_e_ingresar_boletines(self):
    if not os.path.exists(self.pdf_folder):
      os.makedirs(self.pdf_folder, exist_ok=True)
      print(
          f"⚠️ La carpeta '{self.pdf_folder}' no existía. Se ha creado."
          " Coloca tus PDFs del SENAMHI ahí."
      )
      return 0

    archivos_pdf = [
        f for f in os.listdir(self.pdf_folder) if f.endswith(".pdf")
    ]
    if not archivos_pdf:
      print(
          f"⚠️ No se encontraron archivos PDF en la carpeta"
          f" '{self.pdf_folder}'."
      )
      return 0

    docs = []
    metas = []
    ids = []

    total_fragmentos = 0

    for filename in archivos_pdf:
      pdf_path = os.path.join(self.pdf_folder, filename)
      print(f"[INFO] Procesando boletín: {filename}...")

      try:
        reader = PdfReader(pdf_path)
        for page_num, page in enumerate(reader.pages):
          text = page.extract_text()
          if text and len(text.strip()) > 50:  # Evitar páginas vacías
            # Limpieza básica de espacios y saltos de línea
            clean_text = " ".join(text.split())

            docs.append(clean_text)
            metas.append({
                "fuente": "SENAMHI",
                "archivo": filename,
                "pagina": page_num + 1,
            })
            ids.append(f"{filename}_pag_{page_num+1}")
            total_fragmentos += 1

      except Exception as e:
        print(f"[ERROR] No se pudo leer el archivo {filename}: {e}")

    # Ingesta masiva en el RAG
    if docs:
      self.rag_store.add_documents(docs, metas, ids)
      print(
          f"[ÉXITO] Se indexaron {total_fragmentos} fragmentos de los boletines"
          " del SENAMHI en ChromaDB."
      )

    return total_fragmentos