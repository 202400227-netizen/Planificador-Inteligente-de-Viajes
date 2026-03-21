const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Esto creará el archivo saferoute.db en la raíz del proyecto
// ../../ sube dos niveles: de 'routes' a 'src' y de 'src' a la raíz.
const dbPath = path.resolve(__dirname, '../../saferoute.db'); 

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("❌ Error al abrir la base de datos SQLite:", err.message);
    } else {
        console.log("✅ Base de datos SQLite conectada correctamente.");
    }
});

db.serialize(() => {
    // Creamos la tabla con los campos exactos que usa tu server.js e index.js
    db.run(`CREATE TABLE IF NOT EXISTS itinerarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_viaje TEXT,
        origen TEXT,
        destino TEXT,
        clima_temp REAL,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error("❌ Error al crear la tabla 'itinerarios':", err.message);
        }
    });
});

module.exports = db;