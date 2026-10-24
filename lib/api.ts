const API_URL = 'https://rag-price-forecaster-api.onrender.com';

export async function obtenerPrediccionRemota(producto: string) {
  try {
    const res = await fetch(`${API_URL}/api/predict?producto=${encodeURIComponent(producto)}`, {
      cache: 'no-store' // Evita que Vercel guarde en caché respuestas antiguas
    });
    
    if (!res.ok) {
      throw new Error('Error al conectar con el backend en Render');
    }
    
    return await res.json();
  } catch (error) {
    console.error("Fallo la API, usando respaldo local:", error);
    return null;
  }
}
