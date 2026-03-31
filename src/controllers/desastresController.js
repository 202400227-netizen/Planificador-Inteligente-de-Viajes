const DesastresModel = require('../models/desastresModel');

const DesastresController = {
    getEstados: async (req, res) => {
        try {
            const estados = await DesastresModel.getAllEstados();
            res.json({
                success: true,
                data: estados,
                total: estados.length,
                mensaje: 'Lista de estados de México'
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    getEstado: async (req, res) => {
        try {
            const { id } = req.params;
            const estado = await DesastresModel.getEstadoById(id);
            
            if (!estado) {
                return res.status(404).json({ success: false, error: 'Estado no encontrado' });
            }
            
            const alertas = await DesastresModel.getAlertasByEstadoId(estado.id);
            const historial = await DesastresModel.getHistorialByEstadoId(estado.id);
            
            res.json({
                success: true,
                data: {
                    estado,
                    alertas_activas: alertas,
                    historial_reciente: historial
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    getTiposDesastre: async (req, res) => {
        try {
            const tipos = await DesastresModel.getAllTiposDesastre();
            res.json({ success: true, data: tipos });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    getAlertas: async (req, res) => {
        try {
            const { estado } = req.query;
            const alertas = await DesastresModel.getAllAlertas(estado);
            res.json({ success: true, data: alertas, total: alertas.length });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    getHistorial: async (req, res) => {
        try {
            const { estado } = req.query;
            const historial = await DesastresModel.getAllHistorial(estado);
            res.json({ success: true, data: historial, total: historial.length });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    getEstadisticas: async (req, res) => {
        try {
            const estadisticas = await DesastresModel.getEstadisticas();
            const totalAlertas = estadisticas.alertasRegion.reduce((sum, r) => sum + r.alertas_activas, 0);
            
            res.json({
                success: true,
                data: {
                    estados_con_mas_desastres: estadisticas.topEstados,
                    desastres_mas_comunes: estadisticas.topDesastres,
                    alertas_por_region: estadisticas.alertasRegion,
                    total_alertas_activas: totalAlertas
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

module.exports = DesastresController;