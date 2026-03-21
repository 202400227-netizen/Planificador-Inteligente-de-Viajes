async function obtenerUbicacionInicial() {
    const response = await fetch('http://localhost:3000/api/geolocalizacion');
    return await response.json();
}