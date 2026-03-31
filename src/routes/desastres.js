async function buscarDesastres() {
    const estado = document.getElementById('select-estado').value;
    const lista = document.getElementById('lista-alertas');
    
    if (!estado) return;

    try {
        // Consultamos la ruta que configuramos en el server.js
        const response = await fetch(`http://localhost:3000/api/desastres/alertas?estado=${estado}`);
        const result = await response.json();

        lista.innerHTML = ""; // Limpiar

        if (result.success && result.data.length > 0) {
            result.data.forEach(alerta => {
                const div = document.createElement('div');
                div.className = `alerta-item ${alerta.nivel_riesgo === 'Alto' ? 'nivel-alto' : ''}`;
                div.innerHTML = `
                    <h4>${alerta.icono || '⚠️'} ${alerta.tipo_desastre}</h4>
                    <p>${alerta.descripcion}</p>
                    <small>Estado: ${alerta.estado_nombre}</small>
                `;
                lista.appendChild(div);
            });
        } else {
            lista.innerHTML = "<p>✅ No hay alertas activas para esta zona.</p>";
        }
    } catch (error) {
        console.error("Error cargando desastres:", error);
        lista.innerHTML = "<p>⚠️ Error al conectar con el módulo de seguridad.</p>";
    }
}

// Recuerda llamar a buscarDesastres() dentro de tu función principal planificarViaje() en index.js