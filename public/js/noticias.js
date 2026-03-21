async function obtenerNoticias(ciudad) {
    const response = await fetch(`http://localhost:3000/api/noticias?ciudad=${ciudad}`);
    return await response.json();
}