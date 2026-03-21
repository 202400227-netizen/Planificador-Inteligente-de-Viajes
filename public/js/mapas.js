function inicializarMapa(lat, lng) {
    const mapaDiv = document.getElementById('mapa');
    // Aquí va la lógica de Google Maps (requiere el SDK cargado en el HTML)
    const mapa = new google.maps.Map(mapaDiv, {
        center: { lat, lng },
        zoom: 12
    });
}