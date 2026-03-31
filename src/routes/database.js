const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../../saferoute.db'), (err) => {
    if (err) console.error("❌ Error SQLite:", err.message);
    else console.log("✅ Base de datos conectada.");
});

db.serialize(() => {
    // Tabla Itinerarios
    db.run(`CREATE TABLE IF NOT EXISTS itinerarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_viaje TEXT, origen TEXT, destino TEXT, clima_temp REAL,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tablas de Desastres
    db.run(`CREATE TABLE IF NOT EXISTS estados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL, clave TEXT UNIQUE, region TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS tipos_desastre (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL, icono TEXT, nivel_riesgo TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS alertas_activas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        estado_id INTEGER, tipo_desastre_id INTEGER, descripcion TEXT,
        fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP, fecha_fin DATETIME,
        FOREIGN KEY(estado_id) REFERENCES estados(id),
        FOREIGN KEY(tipo_desastre_id) REFERENCES tipos_desastre(id)
    )`);

    // --- SECCIÓN DE DATOS DE PRUEBA (SOLO SI ESTÁ VACÍO) ---
    db.get("SELECT COUNT(*) as count FROM estados", (err, row) => {
        if (row.count === 0) {
            console.log("🌱 Insertando estados de prueba...");
            const stmt = db.prepare("INSERT INTO estados (nombre, clave, region) VALUES (?, ?, ?)");
            stmt.run("Ciudad de México", "CDMX", "Centro");
            stmt.run("Quintana Roo", "QR", "Sureste");
            stmt.run("Jalisco", "JAL", "Occidente");
            stmt.run("Nuevo León", "NL", "Norte");
            stmt.finalize();
        }
    });

    console.log("✨ Tablas y datos de desastres listos.");
});

module.exports = db;