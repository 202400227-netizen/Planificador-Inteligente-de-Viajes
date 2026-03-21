async function obtenerVideos(ciudad) {
    const response = await fetch(`/api/videos?ciudad=${ciudad}`);
    return await response.json();
}