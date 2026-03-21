async function obtenerVideos(ciudad) {
    const response = await fetch(`http://localhost:3000/api/videos?ciudad=${ciudad}`);
    return await response.json();
}