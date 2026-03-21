// index.js
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Detectar ubicación inicial automáticamente
    try {
        const ubicacion = await obtenerUbicacionInicial();
        console.log("Estás en:", ubicacion.city);
        // Podrías cargar el clima de su ciudad actual por defecto
    } catch (e) { console.error("Error en geo", e); }
});

async function planificarViaje() {
    const ciudad = document.getElementById('input-destino').value;
    
    // Ejecutamos todas las llamadas en paralelo para mayor velocidad
    const [datosClima, datosNoticias, datosVideos] = await Promise.all([
        obtenerClima(ciudad),
        obtenerNoticias(ciudad),
        obtenerVideos(ciudad)
    ]);

    // Aquí llamarías a funciones para pintar los resultados en el HTML
    mostrarResultados(datosClima, datosNoticias, datosVideos);
}