import { pool }   from "../core/database/pg.client.js";
import logger     from "../core/logger/logger.js";

// ─── Job: detectar cobranzas vencidas y marcarlas ────────────────────────────

export async function runCobranzaJob(): Promise<void> {
  logger.info("🔄 Job cobranza: verificando vencimientos...");

  try {
    // 1. Marcar como vencidas las que pasaron la fecha y siguen pendientes
    const vencidas = await pool.query(
      `UPDATE cobranza
       SET estado = 'vencida', updated_at = now()
       WHERE fecha_vencimiento < now()
         AND estado NOT IN ('pagado', 'anulado', 'vencida')
       RETURNING id, unidad_id, conjunto_id, numero_recibo, valor_total, fecha_vencimiento`
    );

    if ((vencidas.rowCount ?? 0) > 0) {
      logger.info(`📋 Cobranzas marcadas como vencidas: ${vencidas.rowCount}`);

      // 2. Crear notificación por cada cobranza vencida
      for (const c of vencidas.rows) {
        await pool.query(
          `INSERT INTO notificaciones (conjunto_id, tipo, titulo, contenido, estado, urgente)
           VALUES ($1, 'pago', 'Cobranza vencida', $2, 'pendiente', true)
           ON CONFLICT DO NOTHING`,
          [
            c.conjunto_id,
            `La cobranza ${c.numero_recibo} por $${c.valor_total} venció el ${new Date(c.fecha_vencimiento).toLocaleDateString("es-CO")}`,
          ]
        );
      }
    } else {
      logger.info("✅ No hay cobranzas vencidas nuevas");
    }

    // 3. Estadísticas
    const stats = await pool.query(
      `SELECT estado, COUNT(*) AS total, SUM(valor_total) AS monto
       FROM cobranza
       WHERE estado NOT IN ('anulado')
       GROUP BY estado`
    );
    logger.info({ stats: stats.rows }, "📊 Estado actual de cobranzas");

  } catch (err) {
    logger.error({ err }, "❌ Error en job cobranza");
    throw err;
  }
}