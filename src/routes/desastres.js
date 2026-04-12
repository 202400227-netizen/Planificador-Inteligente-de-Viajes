async function buscarDesastres(destino) {
    const lista = document.getElementById('lista-alertas');
    if (!destino) return;

    try {
        // Buscamos las alertas basándonos en el destino ingresado
        const response = await fetch(`/api/desastres/alertas?estado=${destino}`);
        const result = await response.json();

        lista.innerHTML = ""; // Limpiamos la lista anterior

        if (result.success && result.data.length > 0) {
            result.data.forEach(alerta => {
                const div = document.createElement('div');
                // Estilos para alertas altas o normales
                div.style.padding = "10px";
                div.style.marginBottom = "10px";
                div.style.borderLeft = alerta.nivel_riesgo === 'Alto' ? "4px solid #B83B5E" : "4px solid #F0A500";
                div.style.backgroundColor = "#FAFAFA";
                
                div.innerHTML = `
                    <h4 style="margin:0 0 5px 0;">${alerta.icono || '⚠️'} ${alerta.tipo_desastre}</h4>
                    <p style="margin:0; font-size: 0.9rem;">${alerta.descripcion}</p>
                    <small style="color: #6B7280;">Estado afectado: ${alerta.estado_nombre}</small>
                `;
                lista.appendChild(div);
            });
        } else {
            lista.innerHTML = "<p class='texto-vacio'>No hay alertas de seguridad activas para este destino.</p>";
        }
    } catch (error) {
        console.error("Error cargando desastres:", error);
        lista.innerHTML = "<p class='texto-vacio'>Error al conectar con el módulo de seguridad.</p>";
    }
}