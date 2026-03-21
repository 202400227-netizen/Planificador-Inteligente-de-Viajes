const express = require('express');
const axios = require('axios');
const cors = require('cors');
// Ajustamos la ruta según tu imagen: database.js está en src/routes/
const db = require('./src/routes/database'); 
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ==========================================
// 1. CONSUMO DE APIS EXTERNAS (INTERMEDIARIO)
// ==========================================

// --- GEOLOCALIZACIÓN (ipstack) ---
app.get('/api/geo', async (req, res) => {
    try {
        const response = await axios.get(`http://api.ipstack.com/check?access_key=${process.env.IPSTACK_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error en ipstack" });
    }
});

// --- CLIMA (OpenWeather) ---
app.get('/api/clima', async (req, res) => {
    const { ciudad } = req.query;
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${process.env.OPENWEATHER_KEY}&units=metric&lang=es`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error en OpenWeather" });
    }
});

// --- NOTICIAS (News API) ---
app.get('/api/noticias', async (req, res) => {
    const { ciudad } = req.query;
    try {
        const response = await axios.get(`https://newsapi.org/v2/everything?q=${ciudad}&apiKey=${process.env.NEWS_KEY}&pageSize=3&language=es`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error en News API" });
    }
});

// --- VIDEOS (YouTube) ---
app.get('/api/videos', async (req, res) => {
    const { ciudad } = req.query;
    try {
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=viajar a ${ciudad}&key=${process.env.YOUTUBE_KEY}&maxResults=3&type=video`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error en YouTube API" });
    }
});

// --- MAPAS (Para pasar la Key al Front) ---
app.get('/api/maps-key', (req, res) => {
    res.json({ key: process.env.GOOGLE_MAPS_KEY });
});

// ==========================================
// 2. API REST PROPIA (CRUD EN SQLITE)
// ==========================================

// [GET] Recupera todos los viajes
app.get('/api/itinerarios', (req, res) => {
    const sql = "SELECT * FROM itinerarios ORDER BY id DESC"; // Cambié fecha_creacion por id si no tienes ese campo
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// [POST] Crea un nuevo plan de viaje
app.post('/api/itinerarios', (req, res) => {
    const { nombre_viaje, origen, destino, clima_temp } = req.body;
    const sql = `INSERT INTO itinerarios (nombre_viaje, origen, destino, clima_temp) VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [nombre_viaje, origen, destino, clima_temp], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ 
            id: this.lastID, 
            mensaje: "¡Viaje guardado con éxito!" 
        });
    });
});

// [PUT] Editar un viaje existente
app.put('/api/itinerarios/:id', (req, res) => {
    const { id } = req.params;
    const { nombre_viaje, destino } = req.body;
    const sql = `UPDATE itinerarios SET nombre_viaje = ?, destino = ? WHERE id = ?`;

    db.run(sql, [nombre_viaje, destino, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: "Actualizado correctamente", cambios: this.changes });
    });
});

// [DELETE] Eliminar un itinerario
app.delete('/api/itinerarios/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM itinerarios WHERE id = ?`;

    db.run(sql, id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: "Eliminado", borrados: this.changes });
    });
});

// ==========================================
// INICIO DEL SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor SafeRoute corriendo en http://localhost:${PORT}`);
});