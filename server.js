const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
// Importamos la conexión a la base de datos
const db = require('./src/routes/database'); 
require('dotenv').config();

// ==========================================
// 🔌 IMPORTACIÓN DE RUTAS
// ==========================================
// Ruta de la API de desastres (según tu estructura de carpetas)
const desastresRoutes = require('./api-desastres/routes/desastres');

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Sirve index.html y archivos principales

// ==========================================
// 1. CONSUMO DE APIS EXTERNAS
// ==========================================

// GEOLOCALIZACIÓN (ipstack)
app.get('/api/geo', async (req, res) => {
    try {
        const response = await axios.get(`http://api.ipstack.com/check?access_key=${process.env.IPSTACK_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error en ipstack" });
    }
});

// CLIMA (OpenWeather)
app.get('/api/clima', async (req, res) => {
    const { ciudad } = req.query;
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${process.env.OPENWEATHER_KEY}&units=metric&lang=es`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error en OpenWeather" });
    }
});

// NOTICIAS (News API)
app.get('/api/noticias', async (req, res) => {
    const { ciudad } = req.query;
    try {
        const response = await axios.get(`https://newsapi.org/v2/everything?q=${ciudad}&apiKey=${process.env.NEWS_KEY}&pageSize=3&language=es`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error en News API" });
    }
});

// VIDEOS (YouTube)
app.get('/api/videos', async (req, res) => {
    const { ciudad } = req.query;
    try {
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=viajar a ${ciudad}&key=${process.env.YOUTUBE_KEY}&maxResults=3&type=video`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error en YouTube API" });
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

app.post('/api/itinerarios', (req, res) => {
    console.log("📥 Datos recibidos:", req.body); 
    const { nombre_viaje, origen, destino, clima_temp } = req.body;
    const sql = `INSERT INTO itinerarios (nombre_viaje, origen, destino, clima_temp) VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [nombre_viaje, origen, destino, clima_temp], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, mensaje: "¡Registro creado!" });
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
// 🌊 3. CONEXIÓN API DESASTRES (COMPAÑERO)
// ==========================================

// Endpoints de la API
app.use('/api/desastres', desastresRoutes);

// Servir la interfaz de desastres (HTML secundario)
// Nota: Accederás vía http://localhost:3000/desastres/desastres.html
app.use('/desastres', express.static(path.join(__dirname, 'api-desastres/public')));


// ==========================================
// 🚀 INICIO DEL SERVIDOR
// ==========================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    ===================================================
    ✅ SERVIDOR XOLOGUÍA / SAFEROUTE ACTIVO
    🌍 URL: http://localhost:${PORT}
    🌊 API DESASTRES: http://localhost:${PORT}/api/desastres
    📂 DB SQLITE: Conectada
    ===================================================
    `);
});