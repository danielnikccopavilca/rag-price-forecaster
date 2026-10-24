"""
Módulo 2: Indexación Vectorial RAG con ChromaDB y HNSW
Proyecto: Sistema de IA basado en RAG para Análisis Predictivo de Precios
Autor: Daniel Nik Ccopa Vilca
Escuela de Posgrado Newman
"""

import os
import chromadb
from sentence_transformers import SentenceTransformer

class RAGVectorStore:
    def __init__(self, collection_name="midagri_bulletins", persist_directory="./chroma_db"):
        self.persist_directory = persist_directory
        self.embedding_model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
        
        # Cliente persistente local de ChromaDB
        self.client = chromadb.PersistentClient(path=self.persist_directory)
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"} # Indización HNSW basada en distancia coseno
        )

    def add_documents(self, documents, metadatas, ids):
        """
        Genera embeddings de 384 dimensiones e indexa los fragmentos de texto en ChromaDB.
        """
        print(f"[INFO] Vectorizando {len(documents)} documentos cualitativos...")
        embeddings = self.embedding_model.encode(documents).tolist()
        
        self.collection.add(
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        print(f"[SUCCESS] Indexación completada en la base de datos vectorial ChromaDB.")

    def query_context(self, query_text, n_results=3):
        """
        Recupera semánticamente los fragmentos más relevantes para enriquecer la predicción.
        """
        query_embedding = self.embedding_model.encode([query_text]).tolist()
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=n_results
        )
        return results["documents"][0]

if __name__ == "__main__":
    rag = RAGVectorStore()
    
    # Documentos de prueba cualitativos
    sample_docs = [
        "SENAMHI reporta heladas intensas en el sur andino que afectarán la cosecha de Papa Blanca.",
        "Aumento en el precio del combustible incrementa el costo de flete del Arroz Corriente desde San Martín.",
        "Abastecimiento normal de Cebolla Cabeza Roja en el Gran Mercado Mayorista de Lima (GMML)."
    ]
    sample_meta = [{"fuente": "SENAMHI"}, {"fuente": "BCRP"}, {"fuente": "EMMSA"}]
    sample_ids = ["doc_01", "doc_02", "doc_03"]

    rag.add_documents(sample_docs, sample_meta, sample_ids)
    
    # Recuperación semántica
    context = rag.query_context("¿Cómo está afectando el clima a las papas?")
    print("\n[CONTEXTO RECUPERADO DE CHROMADB]:")
    print(context)