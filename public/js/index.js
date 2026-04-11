async function planificarViaje() {
    const ciudad = document.getElementById('input-destino').value;
    
    if (!ciudad) {
        alert("Por favor, escribe el nombre de una ciudad.");
        return;
    }

    try {
        console.log(`Buscando información para: ${ciudad}...`);

        // 1. LLAMADA A TUS FUNCIONES EXTERNAS
        const [datosClima, datosNoticias, datosVideos] = await Promise.all([
            obtenerClima(ciudad),
            obtenerNoticias(ciudad),
            obtenerVideos(ciudad)
        ]);

        // 2. MOSTRAR CLIMA EN EL HTML
        const climaDiv = document.getElementById('clima-info');
        if (climaDiv && datosClima.weather && datosClima.main) {
            const descripcion = datosClima.weather.description;
            climaDiv.innerHTML = `
                <h3>🌤️ Clima en ${ciudad}</h3>
                <p><strong>Temperatura:</strong> ${datosClima.main.temp}°C</p>
                <p><strong>Estado:</strong> ${descripcion}</p>
                <p><strong>Humedad:</strong> ${datosClima.main.humidity}%</p>
            `;
        }

        // 3. MOSTRAR NOTICIAS EN EL HTML
        const noticiasDiv = document.getElementById('noticias-info');
        if (noticiasDiv && datosNoticias.articles) {
            const listaNoticias = datosNoticias.articles.slice(0, 3).map(art => `
                <div class="noticia-card">
                    <p><strong>${art.title}</strong></p>
                    <a href="${art.url}" target="_blank">Leer noticia</a>
                </div>
            `).join('');
            noticiasDiv.innerHTML = `<h3>📰 Últimas Noticias</h3>${listaNoticias}`;
        }

        // 4. MOSTRAR VIDEOS EN EL HTML
        const videosDiv = document.getElementById('videos-info');
        if (videosDiv && datosVideos.items) {
            const listaVideos = datosVideos.items.map(vid => `
                <div class="video-container" style="margin-bottom: 10px;">
                    <iframe width="100%" height="200" 
                        src="https://www.youtube.com/embed/${vid.id.videoId}" 
                        frameborder="0" allowfullscreen>
                    </iframe>
                </div>
            `).join('');
            videosDiv.innerHTML = `<h3>🎥 Videos de YouTube</h3>${listaVideos}`;
        }

        // 5. INICIALIZAR MAPA
        if (typeof inicializarMapa === "function" && datosClima.coord) {
            inicializarMapa(datosClima.coord.lat, datosClima.coord.lon);
        }

        // ==========================================
        // ✅ 5.5 LLAMADA AL MÓDULO DE DESASTRES (NUEVO)
        // ==========================================
        if (typeof buscarDesastres === "function") {
            buscarDesastres(); 
        }
        // ==========================================

        console.log("✅ Todas las APIs respondieron bien. Guardando en Base de Datos...");

        // 6. GUARDAR EN LA BASE DE DATOS
        if (datosClima.main && datosClima.main.temp) {
            await guardarEnBaseDeDatos(ciudad, datosClima.main.temp);
        }

    } catch (error) {
        console.error("Ocurrió un error en la ejecución:", error);
        alert("No se pudo obtener la información. Revisa la consola y el servidor.");
    }
}

// ... (resto de funciones guardar, eliminar, cargarHistorial se quedan igual)