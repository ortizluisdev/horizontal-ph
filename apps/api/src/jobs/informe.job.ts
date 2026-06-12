import { pool }   from "../core/database/pg.client.js";
import logger     from "../core/logger/logger.js";

// ─── Job: generar resumen mensual por conjunto ────────────────────────────────

export async function runInformeJob(): Promise<void> {
  logger.info("🔄 Job informes: generando resumen mensual...");

  try {
    // 1. Resumen contable del mes actual por conjunto
    const contabilidad = await pool.query(
      `SELECT cj.nombre AS conjunto,
              cm.conjunto_id,
              COUNT(*) AS total_movimientos,
              COALESCE(SUM(cm.valor_debit),  0) AS total_debitos,
              COALESCE(SUM(cm.valor_credit), 0) AS total_creditos,
              COALESCE(SUM(cm.valor_credit), 0) - COALESCE(SUM(cm.valor_debit), 0) AS balance
       FROM contabilidad cm
       INNER JOIN conjuntos cj ON cj.id = cm.conjunto_id
       WHERE DATE_TRUNC('month', cm.fecha_movimiento) = DATE_TRUNC('month', now())
       GROUP BY cm.conjunto_id, cj.nombre
       ORDER BY cj.nombre`
    );

    // 2. Resumen de cobranza del mes
    const cobranza = await pool.query(
      `SELECT conjunto_id,
              COUNT(*) FILTER (WHERE estado = 'pagado')  AS pagadas,
              COUNT(*) FILTER (WHERE estado = 'vencida') AS vencidas,
              COUNT(*) FILTER (WHERE estado = 'pendiente') AS pendientes,
              COALESCE(SUM(valor_total) FILTER (WHERE estado = 'pagado'), 0) AS recaudado
       FROM cobranza
       WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', now())
       GROUP BY conjunto_id`
    );

    // 3. Resumen de PQRS del mes
    const pqrs = await pool.query(
      `SELECT conjunto_id,
              COUNT(*) AS total_radicadas,
              COUNT(*) FILTER (WHERE estado = 'resuelta') AS resueltas,
              COUNT(*) FILTER (WHERE estado = 'abierta')  AS abiertas,
              ROUND(AVG(tiempo_resolucion_dias))           AS promedio_dias_resolucion
       FROM pqrs
       WHERE DATE_TRUNC('month', fecha_radicacion) = DATE_TRUNC('month', now())
       GROUP BY conjunto_id`
    );

    logger.info(
      {
        conjuntos:   contabilidad.rowCount,
        cobranzas:   cobranza.rowCount,
        pqrsResumen: pqrs.rowCount,
      },
      "📊 Informes mensuales generados"
    );

    // TODO: guardar informes en tabla informe_mensual o enviarlos por email

    return;
  } catch (err) {
    logger.error({ err }, "❌ Error en job informes");
    throw err;
  }
}