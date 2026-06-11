import { pool } from "../core/database/pg.client.js";
import { logger } from "../core/logger/logger.js";

export async function runNotificacionJob() {
  logger.info("Job notificaciones: procesando notificaciones pendientes...");
  try {
    const res = await pool.query(`
      SELECT id, usuario_id, tipo, asunto, cuerpo
      FROM notificaciones
      WHERE estado = 'pendiente'
        AND (fecha_programada IS NULL OR fecha_programada <= NOW())
      LIMIT 50
    `);
    logger.info(`Notificaciones a procesar: ${res.rowCount}`);
    // TODO: integrar con proveedor de email/SMS
    for (const notif of res.rows) {
      await pool.query(
        `UPDATE notificaciones SET estado = 'enviado', fecha_envio = NOW() WHERE id = $1`,
        [notif.id]
      );
    }
    return res.rows;
  } catch (err) {
    logger.error({ err }, "Error en job notificacion");
    throw err;
  }
}