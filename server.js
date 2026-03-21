const express = require('express');
const axios = require('axios');
const cors = require('cors');
const db = require('./src/database'); // Tu conexión a SQLite
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Para que reconozca tus carpetas de CSS/JS

// --- 1. LLAMADO A GEOLOCALIZACIÓN (IPStack) ---
app.get('/api/geolocalizacion', async (req, res) => {
    try {
        const response = await axios.get(`http://api.ipstack.com/check?access_key=${process.env.IPSTACK_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error en IPStack" });
    }
});

// --- 2. LLAMADO A CLIMA (OpenWeather) ---
app.get('/api/clima', async (req, res) => {
    const { ciudad } = req.query;
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${process.env.OPENWEATHER_KEY}&units=metric&lang=es`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error en OpenWeather" });
    }
});

// --- 3. LLAMADO A NOTICIAS (NewsAPI) ---
app.get('/api/noticias', async (req, res) => {
    const { ciudad } = req.query;
    try {
        const response = await axios.get(`https://newsapi.org/v2/everything?q=${ciudad}&apiKey=${process.env.NEWS_KEY}&language=es`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error en NewsAPI" });
    }
});

// --- 4. LLAMADO A VIDEOS (YouTube) ---
app.get('/api/videos', async (req, res) => {
    const { ciudad } = req.query;
    try {
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=viajar a ${ciudad}&key=${process.env.YOUTUBE_KEY}&maxResults=3&type=video`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error en YouTube API" });
    }
});

// --- 5. TU PROPIA API REST (SQLite) ---
// Guardar Itinerario (POST)
app.post('/api/itinerarios', (req, res) => {
    const { nombre, origen, destino, temperatura } = req.body;
    const sql = `INSERT INTO itinerarios (nombre_viaje, origen, destino, clima_temp) VALUES (?, ?, ?, ?)`;
    db.run(sql, [nombre, origen, destino, temperatura], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, mensaje: "Guardado en SQLite" });
    });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor SafeRoute en http://localhost:${PORT}`);
});