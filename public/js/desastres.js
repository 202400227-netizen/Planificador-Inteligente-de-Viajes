async function buscarDesastres(destino) {
    const lista = document.getElementById('lista-alertas');
    if (!destino) return;

    try {
        console.log(`[Desastres] Solicitando alertas para: ${destino}`);
        
        // 1. Llamada a la API con encodeURIComponent para evitar errores con espacios
        const response = await fetch(`/api/desastres/alertas?estado=${encodeURIComponent(destino)}`);
        
        if (!response.ok) {
            console.error(`[Desastres] Error en servidor: ${response.status}`);
            lista.innerHTML = "<p class='texto-vacio'>Servicio de alertas temporalmente fuera de línea.</p>";
            return;
        }

        const result = await response.json();
        
        // 2. Extraemos el array 'data' que vimos en tu prueba de Thunder Client
        const alertas = result.data || [];

        console.log(`[Desastres] Alertas encontradas: ${alertas.length}`);

        // 3. Limpiar el contenedor
        lista.innerHTML = "";

        if (alertas.length > 0) {
            alertas.forEach(alerta => {
                const div = document.createElement('div');
                
                // Estilos dinámicos para que se vea como una tarjeta de alerta
                const esCritico = (alerta.nivel_riesgo || '').toLowerCase() === 'alto';
                
                div.style.padding = "15px";
                div.style.marginBottom = "12px";
                div.style.borderRadius = "8px";
                div.style.backgroundColor = "#fff";
                div.style.borderLeft = esCritico ? "6px solid #e74c3c" : "6px solid #f1c40f";
                div.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                
                div.innerHTML = `
                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 1.8rem; margin-right: 12px;">${alerta.icono || '⚠️'}</span>
                        <h4 style="margin:0; color: #2c3e50; font-family: 'Poppins', sans-serif;">${alerta.tipo_desastre}</h4>
                    </div>
                    <p style="margin: 5px 0; color: #555; font-size: 0.95rem; line-height: 1.5;">
                        ${alerta.descripcion}
                    </p>
                    <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #eee;">
                        <small style="color: #7f8c8d; font-weight: 600;">
                            📍 Ubicación: ${alerta.estado_nombre}
                        </small>
                    </div>
                `;
                lista.appendChild(div);
            }); 
        } else {
            // 4. Si la API responde success pero no hay datos para ese estado
            lista.innerHTML = `
                <div style="text-align: center; padding: 20px; background: #f9f9f9; border-radius: 8px;">
                    <p style="color: #27ae60; font-size: 1.2rem; margin: 0;">✅ Zona Segura</p>
                    <p style="color: #7f8c8d; margin-top: 5px;">No hay reportes de desastres para "${destino}" en este momento.</p>
                </div>`;
        }
    } catch (error) {
        console.error("[Desastres] Error fatal en el script:", error);
        lista.innerHTML = "<p class='texto-vacio'>Error al cargar el panel de seguridad.</p>";
    }
}