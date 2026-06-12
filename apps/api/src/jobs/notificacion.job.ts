import { pool }   from "../core/database/pg.client.js";
import logger     from "../core/logger/logger.js";

// ─── Job: procesar cola de notificaciones pendientes ─────────────────────────

const BATCH_SIZE = 50;

export async function runNotificacionJob(): Promise<void> {
  logger.info("🔄 Job notificaciones: procesando cola pendiente...");

  try {
    // 1. Tomar lote de notificaciones listas para enviar
    const res = await pool.query(
      `SELECT id, usuario_id, conjunto_id, tipo, titulo, contenido,
              canal_envio, urgente, numero_reintentos, max_reintentos
       FROM notificaciones
       WHERE estado = 'pendiente'
         AND (fecha_programada IS NULL OR fecha_programada <= now())
       ORDER BY urgente DESC, created_at ASC
       LIMIT $1
       FOR UPDATE SKIP LOCKED`,
      [BATCH_SIZE]
    );

    if ((res.rowCount ?? 0) === 0) {
      logger.info("✅ No hay notificaciones pendientes");
      return;
    }

    logger.info(`📨 Procesando ${res.rowCount} notificaciones`);

    let enviadas = 0;
    let fallidas = 0;

    for (const notif of res.rows) {
      try {
        // TODO: integrar proveedor real (SendGrid, Twilio, FCM, etc.)
        await simulateDelivery(notif);

        await pool.query(
          `UPDATE notificaciones
           SET estado = 'enviada', fecha_envio = now(), updated_at = now()
           WHERE id = $1`,
          [notif.id]
        );
        enviadas++;
      } catch (sendErr) {
        const reintentos = (notif.numero_reintentos ?? 0) + 1;
        const agotado    = reintentos >= (notif.max_reintentos ?? 3);

        await pool.query(
          `UPDATE notificaciones
           SET estado = $1,
               numero_reintentos = $2,
               razon_fallo = $3,
               updated_at = now()
           WHERE id = $4`,
          [
            agotado ? "fallida" : "pendiente",
            reintentos,
            (sendErr as Error).message,
            notif.id,
          ]
        );
        fallidas++;
        logger.warn({ notifId: notif.id, reintentos }, "⚠️ Fallo al enviar notificación");
      }
    }

    logger.info(`✅ Enviadas: ${enviadas} | ❌ Fallidas: ${fallidas}`);

  } catch (err) {
    logger.error({ err }, "❌ Error en job notificaciones");
    throw err;
  }
}

// ─── Placeholder de envío — reemplazar con proveedor real ────────────────────

async function simulateDelivery(notif: { id: string; canal_envio: string | null }) {
  // Aquí conectar SendGrid, Twilio, FCM, etc. según canal_envio
  logger.debug({ notifId: notif.id, canal: notif.canal_envio }, "Simulando envío...");
}