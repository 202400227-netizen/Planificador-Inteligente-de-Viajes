async function buscarDesastres(destino) {
    const lista = document.getElementById('lista-alertas');
    if (!destino) return;

    try {
        console.log(`[Desastres] Buscando alertas para: ${destino}`);
        const response = await fetch(`/api/desastres/alertas?estado=${encodeURIComponent(destino)}`);
        
        if (!response.ok) {
            console.warn(`[Desastres] Backend respondió con ${response.status}`);
            lista.innerHTML = "<p class='texto-vacio'>Servicio de alertas temporalmente no disponible.</p>";
            return;
        }

        const result = await response.json();
        console.log(`[Desastres] Respuesta recibida. Total registros: ${result.data?.length || 0}`);

        let alertas = [];
        if (result.success && Array.isArray(result.data)) {
            alertas = result.data;
        } else if (Array.isArray(result)) {
            alertas = result;
        }

        // Filtrar localmente las alertas que correspondan al estado o capital
        const destinoNormalizado = destino.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const alertasFiltradas = alertas.filter(alerta => {
            const estadoNombre = (alerta.estado_nombre || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const capital = (alerta.capital || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return estadoNombre.includes(destinoNormalizado) || capital.includes(destinoNormalizado);
        });

        console.log(`[Desastres] Alertas después del filtro: ${alertasFiltradas.length}`);

        lista.innerHTML = "";

        if (alertasFiltradas.length > 0) {
            alertasFiltradas.forEach(alerta => {
                const div = document.createElement('div');
                const nivel = (alerta.nivel_riesgo || '').toLowerCase();
                const esAlto = nivel === 'alto' || nivel === 'alta';
                
                div.style.padding = "10px";
                div.style.marginBottom = "10px";
                div.style.borderLeft = esAlto ? "4px solid #B83B5E" : "4px solid #F0A500";
                div.style.backgroundColor = "#FAFAFA";
                
                // Reemplazar emojis por etiquetas de texto
                let icono = alerta.icono || '';
                const mapaIconos = {
                    '🌀': '[Huracan]',
                    '🌎': '[Sismo]',
                    '🌊': '[Inundacion]',
                    '🔥': '[Incendio]',
                    '🌋': '[Volcan]'
                };
                icono = mapaIconos[icono] || icono.replace(/[^\w\s\[\]]/g, '') || '[Alerta]';
                
                const tipoDesastre = alerta.tipo_desastre || alerta.nombre || 'Desastre';
                const descripcion = alerta.descripcion || 'Sin descripcion disponible.';
                const estadoAfectado = alerta.estado_nombre || destino;

                div.innerHTML = `
                    <h4 style="margin:0 0 5px 0;">${icono} ${tipoDesastre}</h4>
                    <p style="margin:0; font-size: 0.9rem;">${descripcion}</p>
                    <small style="color: #6B7280;">Estado afectado: ${estadoAfectado}</small>
                `;
                lista.appendChild(div);
            });
        } else {
            lista.innerHTML = "<p class='texto-vacio'>No hay alertas activas para este destino.</p>";
        }
    } catch (error) {
        console.error("[Desastres] Error crítico:", error);
        lista.innerHTML = "<p class='texto-vacio'>No se pudieron cargar las alertas.</p>";
    }
}