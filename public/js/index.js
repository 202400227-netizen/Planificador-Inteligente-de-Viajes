// public/js/index.js

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
        if (climaDiv) {
            // CORRECCIÓN: La descripción en OpenWeather está dentro de un array
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
                <div class="video-container" style="margin-bottom: 10px;">
                    <iframe width="100%" height="200" 
                        src="https://www.youtube.com/embed/${vid.id.videoId}" 
                        frameborder="0" allowfullscreen>
                    </iframe>
                </div>
            `).join('');
            videosDiv.innerHTML = `<h3>🎥 Videos de YouTube</h3>${listaVideos}`;
        }

        // 5. INICIALIZAR MAPA (Usando las coordenadas de la API de Clima)
        if (typeof inicializarMapa === "function" && datosClima.coord) {
            inicializarMapa(datosClima.coord.lat, datosClima.coord.lon);
        }

        // 6. GUARDAR EN LA BASE DE DATOS
        await guardarEnBaseDeDatos(ciudad, datosClima.main.temp);

    } catch (error) {
        console.error("Error en la planificación:", error);
        alert("No se pudo obtener la información. Revisa la consola y el servidor.");
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
        console.log("Respuesta servidor:", resultado);
        
        cargarHistorial(); 
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
                <li style="display: flex; justify-content: space-between; margin-bottom: 5px; background: #f4f4f4; padding: 8px; border-radius: 4px;">
                    <span><strong>${v.destino}</strong> (${v.clima_temp}°C)</span>
                    <button onclick="eliminarViaje(${v.id})" style="background:red; color:white; border:none; border-radius:3px; cursor:pointer;">Eliminar</button>
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
};