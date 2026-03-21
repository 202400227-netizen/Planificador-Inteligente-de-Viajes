async function obtenerUbicacionInicial() {
    const response = await fetch('/api/geo'); // Ruta relativa
    return await response.json();
}