async function obtenerClima(ciudad) {
    const response = await fetch(`/api/clima?ciudad=${ciudad}`);
    return await response.json();
}