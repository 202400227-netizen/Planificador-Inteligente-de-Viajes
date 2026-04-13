document.addEventListener('DOMContentLoaded', () => {
    cargarHistorial(); 
});

async function planificarViaje() {
    const ciudadDestino = document.getElementById('input-destino').value.trim().toLowerCase();
    
    if (!ciudadDestino) {
        alert("Por favor, escribe el nombre de una ciudad o estado.");
        return;
    }

    try {
        console.log(`Buscando información para: ${ciudadDestino}...`);

        // 1. OBTENER GEOLOCALIZACIÓN
        let nombreOrigenParaHistorial = "Ubicación desconocida";
        let ciudadOrigenDetectada = null;

        try {
            const geoRes = await fetch('https://ipapi.co/json/');
            const geoData = await geoRes.json();
            if (geoData.city) {
                ciudadOrigenDetectada = geoData.city;
                nombreOrigenParaHistorial = `${geoData.city}, ${geoData.country_name}`;
            }
        } catch (e) {
            console.log("No se pudo detectar la ubicación de origen.");
        }

        // 2. ALERTAS DE DESASTRES (CORREGIDO)
        // Asegúrate de que en tu archivo desastres.js la función se llame buscarDesastres
        try {
            const listaAlertas = document.getElementById('lista-alertas');
            listaAlertas.innerHTML = "<p>Buscando alertas...</p>";
            await buscarDesastres(ciudadDestino); 
        } catch (error) {
            console.error("Error en el módulo de desastres:", error);
            document.getElementById('lista-alertas').innerHTML = "<p class='texto-vacio'>No se pudieron cargar las alertas.</p>";
        }

        // 3. LLAMADAS A LAS APIs RESTANTES
        const [climaDestinoRes, noticiasRes, videosRes, climaOrigenRes] = await Promise.allSettled([
            fetch(`/api/clima?ciudad=${ciudadDestino}`).then(res => res.json()),
            fetch(`/api/noticias?ciudad=${ciudadDestino}`).then(res => res.json()),
            fetch(`/api/videos?ciudad=${ciudadDestino}`).then(res => res.json()),
            ciudadOrigenDetectada ? fetch(`/api/clima?ciudad=${ciudadOrigenDetectada}`).then(res => res.json()) : Promise.resolve(null)
        ]);

        // 4. MOSTRAR CLIMA Y COMPARACIÓN
        let tempDestino = 0;
        const climaDiv = document.getElementById('contenido-clima'); 
        
        if (climaDestinoRes.status === 'fulfilled' && climaDestinoRes.value.main) {
            tempDestino = climaDestinoRes.value.main.temp;
            const descripcion = climaDestinoRes.value.weather.description;
            
            let htmlClima = `
                <p><strong>Temperatura:</strong> ${tempDestino}°C</p>
                <p><strong>Estado:</strong> <span style="text-transform: capitalize;">${descripcion}</span></p>
                <p><strong>Humedad:</strong> ${climaDestinoRes.value.main.humidity}%</p>
            `;

            if (climaOrigenRes && climaOrigenRes.status === 'fulfilled' && climaOrigenRes.value && climaOrigenRes.value.main) {
                const tempOrigen = climaOrigenRes.value.main.temp;
                const diferencia = tempDestino - tempOrigen;
                
                let mensaje = "";
                let colorBorde = "";
                let colorFondo = "";

                if (diferencia >= 4) {
                    mensaje = `En ${ciudadDestino} hace más calor que en ${ciudadOrigenDetectada}. Se recomienda llevar ropa ligera y protección solar.`;
                    colorBorde = "#D66D5B"; 
                    colorFondo = "#FFF5F2";
                } else if (diferencia <= -4) {
                    mensaje = `En ${ciudadDestino} hace más frío que en ${ciudadOrigenDetectada}. Se recomienda llevar abrigo o prendas térmicas.`;
                    colorBorde = "#3B5960"; 
                    colorFondo = "#F0F7F8";
                } else {
                    mensaje = `El clima en ${ciudadDestino} es similar al de ${ciudadOrigenDetectada}. Puedes usar ropa parecida a la actual.`;
                    colorBorde = "#A0AEC0";
                    colorFondo = "#F8FAFC";
                }

                htmlClima += `
                    <div style="background-color: ${colorFondo}; border-left: 4px solid ${colorBorde}; padding: 15px; margin-top: 20px; border-radius: 4px; font-size: 0.9em;">
                        <strong style="color: ${colorBorde}; text-transform: uppercase; font-size: 0.8rem; display: block; margin-bottom: 5px;">Sugerencia de Equipaje</strong>
                        ${mensaje}
                    </div>
                `;
            }

            climaDiv.innerHTML = htmlClima;
        } else {
            climaDiv.innerHTML = "<p>No se pudo cargar la información del clima.</p>";
        }

        // 5. MOSTRAR NOTICIAS
        const noticiasDiv = document.getElementById('contenido-noticias');
        if (noticiasRes.status === 'fulfilled' && noticiasRes.value.articles && noticiasRes.value.articles.length > 0) {
            noticiasDiv.innerHTML = noticiasRes.value.articles.slice(0, 3).map(noticia => `
                <div style="margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                    <a href="${noticia.url}" target="_blank" style="text-decoration: none; color: #b13c3c; font-weight: 600;">
                        ${noticia.title}
                    </a>
                    <p style="font-size: 0.85em; margin: 4px 0; color: #666;">Fuente: ${noticia.source.name}</p>
                </div>
            `).join('');
        } else {
            noticiasDiv.innerHTML = "<p>Sin noticias recientes disponibles.</p>";
        }

        // 6. MOSTRAR VIDEOS
        const videosDiv = document.getElementById('contenido-videos');
        if (videosRes.status === 'fulfilled' && videosRes.value.items && videosRes.value.items.length > 0) {
            videosDiv.innerHTML = videosRes.value.items.map(video => `
                <div style="margin-bottom: 20px;">
                    <iframe width="100%" height="180" src="https://www.youtube.com/embed/${video.id.videoId}" frameborder="0" allowfullscreen style="border-radius: 8px;"></iframe>
                    <p style="font-size: 0.85em; margin-top: 8px; font-weight: 500;">${video.snippet.title}</p>
                </div>
            `).join('');
        } else {
            videosDiv.innerHTML = "<p>No se encontraron guías en video.</p>";
        }

        // 7. MAPA
        if (typeof inicializarMapa === 'function') {
            inicializarMapa(ciudadDestino);
        }

        // 8. GUARDAR EN EL HISTORIAL
        await guardarEnHistorial(ciudadDestino, tempDestino, nombreOrigenParaHistorial);

    } catch (error) {
        console.error("Error en la planificación:", error);
        alert("Hubo un error al procesar la solicitud.");
    }
}

async function guardarEnHistorial(destino, temperatura, origen) {
    try {
        const datos = {
            nombre_viaje: `Viaje a ${destino}`,
            origen: origen, 
            destino: destino,
            clima_temp: temperatura 
        };

        await fetch('/api/itinerarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        cargarHistorial(); 
    } catch (error) {
        console.error("Error al guardar itinerario:", error);
    }
}

async function cargarHistorial() {
    const listaHistorial = document.getElementById('historial');
    if (!listaHistorial) return;

    try {
        const response = await fetch('/api/itinerarios');
        const itinerarios = await response.json();

        listaHistorial.innerHTML = "";

        if (!Array.isArray(itinerarios) || itinerarios.length === 0) {
            listaHistorial.innerHTML = "<p class='texto-vacio'>El historial está vacío.</p>";
            return;
        }

        itinerarios.forEach(viaje => {
            const li = document.createElement('li');
            li.style.display = "flex";
            li.style.justifyContent = "space-between";
            li.style.alignItems = "center";
            li.style.marginBottom = "10px";
            li.style.padding = "10px";
            li.style.background = "#fff";
            li.style.borderRadius = "8px";
            li.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";

            li.innerHTML = `
                <div style="flex-grow: 1;">
                    <strong style="color: #3B5960;">${viaje.nombre_viaje}</strong><br>
                    <small style="color: #6B7280;">Destino: ${viaje.destino} | Origen: ${viaje.origen} | ${viaje.clima_temp}°C</small>
                </div>
                <button onclick="eliminarViaje(${viaje.id})" style="background: none; color: #B83B5E; border: 1px solid #B83B5E; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">Eliminar</button>
            `;
            listaHistorial.appendChild(li);
        });
    } catch (error) {
        console.error("Error al cargar historial:", error);
    }
}

async function eliminarViaje(id) {
    if(!confirm("¿Desea eliminar este registro del historial?")) return;
    try {
        await fetch(`/api/itinerarios/${id}`, { method: 'DELETE' });
        cargarHistorial(); 
    } catch (error) {
        console.error("Error al eliminar:", error);
    }
}