function inicializarMapa(lat, lng) {
    const mapaDiv = document.getElementById('mapa');
    if (!mapaDiv) return;
    
    const mapa = new google.maps.Map(mapaDiv, {
        center: { lat, lng },
        zoom: 12
    });
}