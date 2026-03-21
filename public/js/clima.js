async function obtenerClima(ciudad) {
    const response = await fetch(`http://localhost:3000/api/clima?ciudad=${ciudad}`);
    return await response.json();
}