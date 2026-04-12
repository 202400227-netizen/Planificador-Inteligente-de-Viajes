async function inicializarMapa(ciudad) {
    const mapaDiv = document.getElementById('mapa');
    if (!mapaDiv) return;

    mapaDiv.innerHTML = "<p style='padding:20px; text-align:center;'>Cargando mapa...</p>";

    try {
        const response = await fetch(`/api/coordenadas?ciudad=${ciudad}`);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const lat = data.results[0].geometry.location.lat;
            const lng = data.results[0].geometry.location.lng;

            // URL directa y segura de Google Maps Embed
            mapaDiv.innerHTML = `
                <iframe 
                    width="100%" 
                    height="100%" 
                    style="border:0; border-radius: 12px; min-height: 400px;" 
                    loading="lazy" 
                    allowfullscreen 
                    src="https://maps.google.com/maps?q=${lat},${lng}&hl=es&z=13&output=embed">
                </iframe>
            `;
        } else {
            mapaDiv.innerHTML = "<p style='padding:20px; text-align:center;'>No se encontraron coordenadas para esta ciudad.</p>";
        }
    } catch (error) {
        console.error("Error al cargar el mapa:", error);
        mapaDiv.innerHTML = "<p style='padding:20px; text-align:center;'>Error al cargar el mapa.</p>";
    }
}