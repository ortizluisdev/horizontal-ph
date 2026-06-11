import { pool } from "../core/database/pg.client.js";
import { logger } from "../core/logger/logger.js";

export async function runInformeJob() {
  logger.info("Job informe: generando resumen mensual...");
  try {
    const res = await pool.query(`
      SELECT conjunto_id,
             COUNT(*) AS total_movimientos,
             SUM(valor_debit) AS total_debitos,
             SUM(valor_credit) AS total_creditos
      FROM contabilidad
      WHERE DATE_TRUNC('month', fecha_movimiento) = DATE_TRUNC('month', NOW())
      GROUP BY conjunto_id
    `);
    logger.info(`Informes generados para ${res.rowCount} conjuntos`);
    return res.rows;
  } catch (err) {
    logger.error({ err }, "Error en job informe");
    throw err;
  }
}