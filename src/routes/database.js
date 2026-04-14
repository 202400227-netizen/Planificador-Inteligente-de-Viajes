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

    // Tablas de los estrados
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

    // Insertar los 32 estados si no existen
    db.get("SELECT COUNT(*) as count FROM estados", (err, row) => {
        if (row.count === 0) {
            console.log("Insertando los 32 estados de México...");
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
            stmt.finalize(() => {
                console.log("Estados insertados.");
                insertarTiposDesastre();
            });
        } else {
            insertarTiposDesastre();
        }
    });

    function insertarTiposDesastre() {
        db.get("SELECT COUNT(*) as count FROM tipos_desastre", (err, row) => {
            if (row.count === 0) {
                console.log("Insertando tipos de desastre...");
                const stmt = db.prepare("INSERT INTO tipos_desastre (nombre, icono, nivel_riesgo) VALUES (?, ?, ?)");
                stmt.run("Huracán", "🌀", "Alto");
                stmt.run("Sismo", "🌎", "Alto");
                stmt.run("Inundación", "🌊", "Alto");
                stmt.run("Sequía e Incendio", "🔥", "Medio");
                stmt.run("Actividad Volcánica", "🌋", "Medio");
                stmt.finalize(() => {
                    console.log("Tipos de desastre insertados.");
                    insertarAlertasActivas();
                });
            } else {
                insertarAlertasActivas();
            }
        });
    }

    function insertarAlertasActivas() {
        db.get("SELECT COUNT(*) as count FROM alertas_activas", (err, row) => {
            if (row.count > 0) {
                console.log("Las alertas ya existen. No se insertarán duplicados.");
                return;
            }
            console.log("Insertando alertas activas para los 32 estados...");

            // Mapa de riesgo principal por estado (basado en la clasificación proporcionada)
            const riesgoPorEstado = {
                // Huracanes (Pacífico y Atlántico)
                "Baja California Sur": "Huracán",
                "Sinaloa": "Huracán",
                "Nayarit": "Huracán",
                "Jalisco": "Huracán",
                "Colima": "Huracán",
                "Michoacán": "Huracán",
                "Guerrero": "Huracán",
                "Oaxaca": "Huracán",  // También sismos, pero prevalece huracán en costa
                "Chiapas": "Huracán",
                "Quintana Roo": "Huracán",
                "Yucatán": "Huracán",
                "Campeche": "Huracán",
                "Tabasco": "Huracán",
                "Veracruz": "Huracán",
                "Tamaulipas": "Huracán",
                // Sismos (zonas de alta sismicidad)
                "Ciudad de México": "Sismo",
                "Estado de México": "Sismo",
                "Puebla": "Sismo",
                "Morelos": "Sismo",
                // Inundaciones (estados con mayor riesgo)
                // Ya algunos están en huracanes, pero Tabasco y Veracruz tienen doble riesgo; dejamos huracán
                // Sequías e incendios (norte)
                "Chihuahua": "Sequía e Incendio",
                "Coahuila": "Sequía e Incendio",
                "Sonora": "Sequía e Incendio",
                "Durango": "Sequía e Incendio",
                "Nuevo León": "Sequía e Incendio",
                "Zacatecas": "Sequía e Incendio",
                "San Luis Potosí": "Sequía e Incendio",
                "Baja California": "Sequía e Incendio",
                // Actividad volcánica
                "Tlaxcala": "Actividad Volcánica",
                // Otros estados con sismos
                "Aguascalientes": "Sismo",
                "Guanajuato": "Sismo",
                "Hidalgo": "Sismo",
                "Querétaro": "Sismo"
            };

            // Descripciones específicas por tipo
            const descripciones = {
                "Huracán": "Temporada de huracanes activa (mayo-noviembre). Posibles vientos fuertes y lluvias torrenciales. Ubique refugios y asegure documentos.",
                "Sismo": "Zona sísmica activa. Impredecible. Participe en simulacros y tenga lista mochila de emergencia.",
                "Inundación": "Riesgo de inundaciones por lluvias intensas. Evite cruzar corrientes y ubique rutas a zonas altas.",
                "Sequía e Incendio": "Temporada de estiaje (marzo-junio). Alto riesgo de incendios forestales. Racionalice agua y evite fogatas.",
                "Actividad Volcánica": "Actividad volcánica en monitoreo. Posible caída de ceniza. Cubra depósitos de agua y use cubrebocas."
            };

            // Obtener todos los estados y tipos de desastre
            db.all("SELECT id, nombre FROM estados", [], (err, estados) => {
                if (err) { console.error(err); return; }
                db.all("SELECT id, nombre FROM tipos_desastre", [], (err, tipos) => {
                    if (err) { console.error(err); return; }

                    const tipoMap = {};
                    tipos.forEach(t => tipoMap[t.nombre] = t.id);

                    const stmt = db.prepare("INSERT INTO alertas_activas (estado_id, tipo_desastre_id, descripcion) VALUES (?, ?, ?)");
                    estados.forEach(estado => {
                        const tipoNombre = riesgoPorEstado[estado.nombre] || "Sismo"; // Por defecto sismo
                        const tipoId = tipoMap[tipoNombre];
                        if (tipoId) {
                            const desc = descripciones[tipoNombre] || "Manténgase informado por canales oficiales.";
                            stmt.run(estado.id, tipoId, desc);
                        }
                    });
                    stmt.finalize(() => {
                        console.log("Alertas activas insertadas para todos los estados.");
                    });
                });
            });
        });
    }

    console.log("Inicialización de base de datos completada.");
});

module.exports = db;