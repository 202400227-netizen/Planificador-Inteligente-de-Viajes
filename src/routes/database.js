const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Esto crea el archivo EXACTAMENTE en la carpeta principal de tu proyecto
const dbPath = path.join(process.cwd(), 'saferoute.db'); 

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("Error:", err.message);
    else console.log("✅ Conectado en:", dbPath);
});

db.serialize(() => {
    // ESTO CREA LA TABLA FÍSICAMENTE
    db.run(`CREATE TABLE IF NOT EXISTS itinerarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_viaje TEXT,
        origen TEXT,
        destino TEXT,
        clima_temp REAL,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

module.exports = db;