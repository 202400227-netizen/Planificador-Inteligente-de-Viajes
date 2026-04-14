const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const db = require('./src/routes/database'); 
require('dotenv').config();

const desastresRoutes = require('./src/routes/desastres');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ==========================================
// 1. CONSUMO DE APIS EXTERNAS (LAS 5 APIS)
// ==========================================

// 1. GEOLOCALIZACIÓN (ipstack)
app.get('/api/geo', async (req, res) => {
    try {
        const response = await axios.get(`http://api.ipstack.com/check?access_key=${process.env.IPSTACK_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error en ipstack" });
    }
});

// 2. CLIMA (OpenWeather)
app.get('/api/clima', async (req, res) => {
    const { ciudad } = req.query;
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${process.env.OPENWEATHER_KEY}&units=metric&lang=es`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error en OpenWeather" });
    }
});

// 3. NOTICIAS (News API) - Limitado a 1 mes de antigüedad máximo (Gratis)
app.get('/api/noticias', async (req, res) => {
    const { ciudad } = req.query;
    try {
        // Se agregó sortBy=publishedAt para traer las más recientes
        const response = await axios.get(`https://newsapi.org/v2/everything?q=${ciudad}&apiKey=${process.env.NEWS_KEY}&pageSize=3&language=es&sortBy=publishedAt`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error en News API" });
    }
});

// 4. VIDEOS (YouTube)
app.get('/api/videos', async (req, res) => {
    const { ciudad } = req.query;
    try {
        // Se agregó videoEmbeddable=true para evitar videos bloqueados
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=viajar a ${ciudad}&key=${process.env.YOUTUBE_KEY}&maxResults=3&type=video&videoEmbeddable=true`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error en YouTube API" });
    }
});

// 5. MAPAS (Google Geocoding)
app.get('/api/coordenadas', async (req, res) => {
    const { ciudad } = req.query;
    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${ciudad}&key=${process.env.GOOGLE_MAPS_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error en Google Maps API" });
    }
});

// ==========================================
// 2. API REST PROPIA (ITINERARIOS - SQLITE)
// ==========================================

app.get('/api/itinerarios', (req, res) => {
    const sql = "SELECT * FROM itinerarios ORDER BY id DESC";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Ejemplo de cómo debe quedar tu ruta POST en server.js
app.post('/api/itinerarios', (req, res) => {
    const { nombre_viaje, origen, destino, clima_temp } = req.body;

    // EL TRUCO ESTÁ AQUÍ: usamos datetime('now', 'localtime') para arreglar la hora
    const sql = `INSERT INTO itinerarios (nombre_viaje, origen, destino, clima_temp, fecha_registro) 
                 VALUES (?, ?, ?, ?, datetime('now', 'localtime'))`;

    db.run(sql, [nombre_viaje, origen, destino, clima_temp], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

app.put('/api/itinerarios/:id', (req, res) => {
    const { id } = req.params;
    const { nombre_viaje, destino } = req.body;
    const sql = `UPDATE itinerarios SET nombre_viaje = ?, destino = ? WHERE id = ?`;
    db.run(sql, [nombre_viaje, destino, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: "Actualizado correctamente", id });
    });
});

app.delete('/api/itinerarios/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM itinerarios WHERE id = ?`;
    db.run(sql, id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: "Eliminado con éxito", id_borrado: id });
    });
});

// ==========================================
// 3. CONEXIÓN API DESASTRES
// ==========================================
app.use('/api/desastres', desastresRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`URL: http://localhost:${PORT}`);
});