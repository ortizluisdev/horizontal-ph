import { pool } from "../core/database/pg.client.js";
import { logger } from "../core/logger/logger.js";

export async function runCobranzaJob() {
  logger.info("Job cobranza: verificando vencimientos...");
  try {
    const res = await pool.query(`
      SELECT id, unidad_id, numero_recibo, valor_total, fecha_vencimiento
      FROM cobranza
      WHERE fecha_vencimiento < NOW()
        AND estado NOT IN ('pagado', 'anulado')
    `);
    logger.info(`Cobranzas vencidas encontradas: ${res.rowCount}`);
    // TODO: enviar notificaciones por cada cobranza vencida
    return res.rows;
  } catch (err) {
    logger.error({ err }, "Error en job cobranza");
    throw err;
  }
}