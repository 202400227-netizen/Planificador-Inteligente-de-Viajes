const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crear la conexión (yo la llamaré "db" para que coincida con tu server.js)
const db = new sqlite3.Database(path.join(__dirname, '../../saferoute.db'), (err) => {
    if (err) {
        console.error("❌ Error al conectar con SQLite:", err.message);
    } else {
        console.log("✅ Base de datos SQLite conectada correctamente.");
    }
});

// Crear la tabla si no existe
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS itinerarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_viaje TEXT,
        origen TEXT,
        destino TEXT,
        clima_temp REAL,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// EL ERROR ESTABA AQUÍ: El nombre debe ser "db"
module.exports = db;