const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../../saferoute.db'), (err) => {
    if (err) console.error("Error SQLite:", err.message);
    else console.log("Base de datos conectada.");
});

db.serialize(() => {
    // Tabla Itinerarios
    db.run(`CREATE TABLE IF NOT EXISTS itinerarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_viaje TEXT, origen TEXT, destino TEXT, clima_temp REAL,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tablas de Desastres (Aquí está agregada la columna 'capital')
    db.run(`CREATE TABLE IF NOT EXISTS estados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL, 
        capital TEXT, 
        clave TEXT UNIQUE, 
        region TEXT
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

    // --- SECCIÓN DE DATOS DE PRUEBA (LOS 32 ESTADOS) ---
    db.get("SELECT COUNT(*) as count FROM estados", (err, row) => {
        if (row.count === 0) {
            console.log("Insertando los 32 estados de prueba...");
            const stmt = db.prepare("INSERT INTO estados (nombre, capital, clave, region) VALUES (?, ?, ?, ?)");
            
            const estadosMexico = [
                { n: "Aguascalientes", c: "Aguascalientes", cl: "AGS", r: "Centro" },
                { n: "Baja California", c: "Mexicali", cl: "BC", r: "Norte" },
                { n: "Baja California Sur", c: "La Paz", cl: "BCS", r: "Norte" },
                { n: "Campeche", c: "Campeche", cl: "CAMP", r: "Sureste" },
                { n: "Chiapas", c: "Tuxtla Gutiérrez", cl: "CHIS", r: "Sur" },
                { n: "Chihuahua", c: "Chihuahua", cl: "CHIH", r: "Norte" },
                { n: "Ciudad de México", c: "Ciudad de México", cl: "CDMX", r: "Centro" },
                { n: "Coahuila", c: "Saltillo", cl: "COAH", r: "Norte" },
                { n: "Colima", c: "Colima", cl: "COL", r: "Occidente" },
                { n: "Durango", c: "Victoria de Durango", cl: "DGO", r: "Norte" },
                { n: "Guanajuato", c: "Guanajuato", cl: "GTO", r: "Centro" },
                { n: "Guerrero", c: "Chilpancingo", cl: "GRO", r: "Sur" },
                { n: "Hidalgo", c: "Pachuca", cl: "HGO", r: "Centro" },
                { n: "Jalisco", c: "Guadalajara", cl: "JAL", r: "Occidente" },
                { n: "Estado de México", c: "Toluca", cl: "MEX", r: "Centro" },
                { n: "Michoacán", c: "Morelia", cl: "MICH", r: "Occidente" },
                { n: "Morelos", c: "Cuernavaca", cl: "MOR", r: "Centro" },
                { n: "Nayarit", c: "Tepic", cl: "NAY", r: "Occidente" },
                { n: "Nuevo León", c: "Monterrey", cl: "NL", r: "Norte" },
                { n: "Oaxaca", c: "Oaxaca de Juárez", cl: "OAX", r: "Sur" },
                { n: "Puebla", c: "Puebla de Zaragoza", cl: "PUE", r: "Centro" },
                { n: "Querétaro", c: "Santiago de Querétaro", cl: "QRO", r: "Centro" },
                { n: "Quintana Roo", c: "Chetumal", cl: "ROO", r: "Sureste" },
                { n: "San Luis Potosí", c: "San Luis Potosí", cl: "SLP", r: "Centro" },
                { n: "Sinaloa", c: "Culiacán", cl: "SIN", r: "Norte" },
                { n: "Sonora", c: "Hermosillo", cl: "SON", r: "Norte" },
                { n: "Tabasco", c: "Villahermosa", cl: "TAB", r: "Sureste" },
                { n: "Tamaulipas", c: "Ciudad Victoria", cl: "TAM", r: "Norte" },
                { n: "Tlaxcala", c: "Tlaxcala de Xicohténcatl", cl: "TLAX", r: "Centro" },
                { n: "Veracruz", c: "Xalapa", cl: "VER", r: "Oriente" },
                { n: "Yucatán", c: "Mérida", cl: "YUC", r: "Sureste" },
                { n: "Zacatecas", c: "Zacatecas", cl: "ZAC", r: "Centro" }
            ];

            estadosMexico.forEach(est => stmt.run(est.n, est.c, est.cl, est.r));
            stmt.finalize();
        }
    });

    console.log("Tablas y datos listos.");
});

module.exports = db;