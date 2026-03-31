// Usamos el archivo de base de datos que ya tenías en tu proyecto
const db = require('../routes/database'); 

const DesastresModel = {
    getAllEstados: () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM estados ORDER BY nombre', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },
    getEstadoById: (id) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM estados WHERE id = ? OR clave = ?', [id, id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },
    getAlertasByEstadoId: (estadoId) => {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT a.*, t.nombre as tipo_desastre, t.icono, t.nivel_riesgo
                FROM alertas_activas a
                JOIN tipos_desastre t ON a.tipo_desastre_id = t.id
                WHERE a.estado_id = ? AND (a.fecha_fin IS NULL OR a.fecha_fin > datetime('now'))
            `, [estadoId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },
    getHistorialByEstadoId: (estadoId) => {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT h.*, t.nombre as tipo_desastre, t.icono
                FROM historial_desastres h
                JOIN tipos_desastre t ON h.tipo_desastre_id = t.id
                WHERE h.estado_id = ?
                ORDER BY h.fecha DESC
                LIMIT 10
            `, [estadoId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },
    getAllTiposDesastre: () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM tipos_desastre', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },
    getAllAlertas: (estado = null) => {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT a.*, e.nombre as estado_nombre, e.clave, t.nombre as tipo_desastre, t.icono
                FROM alertas_activas a
                JOIN estados e ON a.estado_id = e.id
                JOIN tipos_desastre t ON a.tipo_desastre_id = t.id
                WHERE a.fecha_fin IS NULL OR a.fecha_fin > datetime('now')
            `;
            let params = [];
            
            if (estado) {
                query += ` AND (e.clave = ? OR e.nombre LIKE ?)`;
                params = [estado, `%${estado}%`];
            }
            
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },
    getAllHistorial: (estado = null) => {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT h.*, e.nombre as estado_nombre, e.clave, t.nombre as tipo_desastre, t.icono
                FROM historial_desastres h
                JOIN estados e ON h.estado_id = e.id
                JOIN tipos_desastre t ON h.tipo_desastre_id = t.id
                ORDER BY h.fecha DESC
            `;
            let params = [];
            
            if (estado) {
                query = `
                    SELECT h.*, e.nombre as estado_nombre, e.clave, t.nombre as tipo_desastre, t.icono
                    FROM historial_desastres h
                    JOIN estados e ON h.estado_id = e.id
                    JOIN tipos_desastre t ON h.tipo_desastre_id = t.id
                    WHERE e.clave = ? OR e.nombre LIKE ?
                    ORDER BY h.fecha DESC
                `;
                params = [estado, `%${estado}%`];
            }
            
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },
    getEstadisticas: () => {
        return new Promise((resolve, reject) => {
            const queries = {
                topEstados: `SELECT e.nombre, COUNT(h.id) as total_desastres, COALESCE(SUM(h.fallecidos), 0) as total_fallecidos
                            FROM estados e
                            LEFT JOIN historial_desastres h ON e.id = h.estado_id
                            GROUP BY e.id
                            ORDER BY total_desastres DESC
                            LIMIT 10`,
                topDesastres: `SELECT t.nombre, COUNT(h.id) as total, t.icono
                              FROM tipos_desastre t
                              LEFT JOIN historial_desastres h ON t.id = h.tipo_desastre_id
                              GROUP BY t.id
                              ORDER BY total DESC`,
                alertasRegion: `SELECT e.region, COUNT(a.id) as alertas_activas
                                  FROM estados e
                                  LEFT JOIN alertas_activas a ON e.id = a.estado_id 
                                  WHERE a.fecha_fin IS NULL OR a.fecha_fin > datetime('now')
                                  GROUP BY e.region`
            };
            
            db.all(queries.topEstados, [], (err, topEstados) => {
                if (err) reject(err);
                db.all(queries.topDesastres, [], (err, topDesastres) => {
                    if (err) reject(err);
                    db.all(queries.alertasRegion, [], (err, alertasRegion) => {
                        if (err) reject(err);
                        resolve({ topEstados, topDesastres, alertasRegion });
                    });
                });
            });
        });
    }
};

module.exports = DesastresModel;