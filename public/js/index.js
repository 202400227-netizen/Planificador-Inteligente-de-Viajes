// public/js/index.js

async function planificarViaje() {
    const ciudad = document.getElementById('input-destino').value;
    
    if (!ciudad) {
        alert("Por favor, escribe el nombre de una ciudad.");
        return;
    }

    try {
        console.log(`Buscando información para: ${ciudad}...`);

        // 1. LLAMADA A TUS FUNCIONES EXTERNAS (clima.js, noticias.js, youtube.js)
        // Usamos Promise.all para que todas las peticiones se hagan al mismo tiempo (más rápido)
        const [datosClima, datosNoticias, datosVideos] = await Promise.all([
            obtenerClima(ciudad),
            obtenerNoticias(ciudad),
            obtenerVideos(ciudad)
        ]);

        // 2. MOSTRAR CLIMA EN EL HTML
        const climaDiv = document.getElementById('clima-info');
        if (climaDiv) {
            climaDiv.innerHTML = `
                <h3>🌤️ Clima en ${ciudad}</h3>
                <p><strong>Temperatura:</strong> ${datosClima.main.temp}°C</p>
                <p><strong>Estado:</strong> ${datosClima.weather.description}</p>
                <p><strong>Humedad:</strong> ${datosClima.main.humidity}%</p>
            `;
        }

        // 3. MOSTRAR NOTICIAS EN EL HTML
        const noticiasDiv = document.getElementById('noticias-info');
        if (noticiasDiv) {
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
        if (videosDiv) {
            const listaVideos = datosVideos.items.map(vid => `
                <div class="video-container">
                    <iframe width="100%" height="200" 
                        src="https://www.youtube.com/embed/${vid.id.videoId}" 
                        frameborder="0" allowfullscreen>
                    </iframe>
                </div>
            `).join('');
            videosDiv.innerHTML = `<h3>🎥 Videos de YouTube</h3>${listaVideos}`;
        }

        // 5. GUARDAR EN LA BASE DE DATOS (MÉTODO POST)
        await guardarEnBaseDeDatos(ciudad, datosClima.main.temp);

    } catch (error) {
        console.error("Error en la planificación:", error);
        alert("No se pudo obtener la información. Revisa que el servidor esté corriendo.");
    }
}

// --- FUNCIÓN PARA GUARDAR EN SQLITE ---
async function guardarEnBaseDeDatos(destino, temp) {
    const datosParaGuardar = {
        nombre_viaje: "Exploración a " + destino,
        origen: "Ubicación actual",
        destino: destino,
        clima_temp: temp
    };

    try {
        const res = await fetch('/api/itinerarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosParaGuardar)
        });
        const resultado = await res.json();
        console.log("Guardado en DB:", resultado.mensaje);
        
        // Refrescamos la lista de viajes guardados (si tienes la función)
        if (typeof cargarHistorial === "function") cargarHistorial();
        
    } catch (err) {
        console.error("Error al guardar en DB:", err);
    }
}

// --- CARGAR HISTORIAL AL INICIO ---
async function cargarHistorial() {
    try {
        const res = await fetch('/api/itinerarios');
        const viajes = await res.json();
        const historialUl = document.getElementById('historial');
        
        if (historialUl) {
            historialUl.innerHTML = viajes.map(v => `
                <li>
                    <strong>${v.destino}</strong> (${v.clima_temp}°C)
                    <button onclick="eliminarViaje(${v.id})">❌</button>
                </li>
            `).join('');
        }
    } catch (err) {
        console.log("Error cargando historial");
    }
}

async function eliminarViaje(id) {
    if (confirm("¿Eliminar este viaje?")) {
        await fetch(`/api/itinerarios/${id}`, { method: 'DELETE' });
        cargarHistorial();
    }
}

// Ejecutar al cargar la página
window.onload = () => {
    cargarHistorial();
    // Opcional: obtenerUbicacionInicial() si quieres geo al inicio
};