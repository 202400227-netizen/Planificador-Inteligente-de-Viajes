async function obtenerNoticias(ciudad) {
    const response = await fetch(`/api/noticias?ciudad=${ciudad}`);
    return await response.json();
}