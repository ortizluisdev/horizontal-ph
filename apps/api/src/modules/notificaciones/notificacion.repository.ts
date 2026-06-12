import { pool } from "../../core/database/pg.client.js";
import type { Notificacion } from "@horizontal-ph/types";
import type {
  NotificacionCreateInput,
  NotificacionUpdateInput,
  NotificacionQuery,
} from "./notificacion.schema.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginatedNotificaciones {
  data:  Notificacion[];
  total: number;
  page:  number;
  limit: number;
  pages: number;
}

// ─── Repository ───────────────────────────────────────────────────────────────

export class NotificacionRepository {

  async list(query: NotificacionQuery, tenantId: string): Promise<PaginatedNotificaciones> {
    const { page, limit, conjuntoId, usuarioId, tipo, estado, canal, importante, urgente, fechaDesde, fechaHasta } = query;
    const offset = (page - 1) * limit;

    const conditions: string[] = ["cj.tenant_id = $1"];
    const values: unknown[]    = [tenantId];
    let idx = 2;

    if (conjuntoId) { conditions.push(`n.conjunto_id = $${idx++}`);  values.push(conjuntoId); }
    if (usuarioId)  { conditions.push(`n.usuario_id = $${idx++}`);   values.push(usuarioId); }
    if (tipo)       { conditions.push(`n.tipo = $${idx++}`);          values.push(tipo); }
    if (estado)     { conditions.push(`n.estado = $${idx++}`);        values.push(estado); }
    if (canal)      { conditions.push(`n.canal_envio = $${idx++}`);   values.push(canal); }
    if (importante !== undefined) { conditions.push(`n.importante = $${idx++}`); values.push(importante); }
    if (urgente !== undefined)    { conditions.push(`n.urgente = $${idx++}`);    values.push(urgente); }
    if (fechaDesde) { conditions.push(`n.fecha_programada >= $${idx++}`); values.push(fechaDesde); }
    if (fechaHasta) { conditions.push(`n.fecha_programada <= $${idx++}`); values.push(fechaHasta); }

    const where = `WHERE ${conditions.join(" AND ")}`;

    const [dataRes, countRes] = await Promise.all([
      pool.query<Notificacion>(
        `SELECT n.id, n.conjunto_id, n.usuario_id, n.template_id,
                n.tipo, n.titulo, n.contenido, n.estado, n.canal_envio,
                n.fecha_programada, n.fecha_envio, n.fecha_entrega, n.fecha_lectura,
                n.importante, n.urgente, n.requiere_confirmacion, n.confirmada,
                n.numero_reintentos, n.max_reintentos, n.destinatarios,
                n.created_at, n.updated_at
         FROM notificaciones n
         INNER JOIN conjuntos cj ON cj.id = n.conjunto_id
         ${where}
         ORDER BY n.created_at DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
        [...values, limit, offset]
      ),
      pool.query<{ total: string }>(
        `SELECT COUNT(*) AS total
         FROM notificaciones n
         INNER JOIN conjuntos cj ON cj.id = n.conjunto_id
         ${where}`,
        values
      ),
    ]);

    const total = parseInt(countRes.rows[0].total, 10);
    return { data: dataRes.rows, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findById(id: string, tenantId: string): Promise<Notificacion | null> {
    const res = await pool.query<Notificacion>(
      `SELECT n.*
       FROM notificaciones n
       INNER JOIN conjuntos cj ON cj.id = n.conjunto_id
       WHERE n.id = $1 AND cj.tenant_id = $2
       LIMIT 1`,
      [id, tenantId]
    );
    return res.rows[0] ?? null;
  }

  async create(data: NotificacionCreateInput, tenantId: string): Promise<Notificacion> {
    // Validar que el conjunto pertenece al tenant
    const conjunto = await pool.query(
      `SELECT id FROM conjuntos WHERE id = $1 AND tenant_id = $2 LIMIT 1`,
      [data.conjuntoId, tenantId]
    );
    if (!conjunto.rows[0]) {
      throw Object.assign(
        new Error("Conjunto no encontrado o no pertenece al tenant"),
        { statusCode: 403 }
      );
    }

    const res = await pool.query<{ id: string }>(
      `INSERT INTO notificaciones (
         conjunto_id, usuario_id, template_id, tipo, titulo, contenido,
         canal_envio, fecha_programada, importante, urgente,
         requiere_confirmacion, max_reintentos, destinatarios, datos_variables
       ) VALUES (
         $1,$2,$3,$4,$5,$6,
         $7,$8,$9,$10,
         $11,$12,$13,$14
       ) RETURNING id`,
      [
        data.conjuntoId,
        data.usuarioId           ?? null,
        data.templateId          ?? null,
        data.tipo,
        data.titulo,
        data.contenido,
        data.canal_envio         ?? null,
        data.fecha_programada    ?? null,
        data.importante          ?? false,
        data.urgente             ?? false,
        data.requiere_confirmacion ?? false,
        data.max_reintentos      ?? 3,
        data.destinatarios       ? JSON.stringify(data.destinatarios) : null,
        data.datos_variables     ? JSON.stringify(data.datos_variables) : null,
      ]
    );

    return (await this.findById(res.rows[0].id, tenantId)) as Notificacion;
  }

  async update(id: string, data: NotificacionUpdateInput): Promise<void> {
    const sets: string[]    = [];
    const values: unknown[] = [];
    let idx = 1;

    const fields: (keyof NotificacionUpdateInput)[] = [
      "estado", "razon_fallo", "confirmada",
      "fecha_lectura", "fecha_entrega", "importante", "urgente",
    ];

    for (const field of fields) {
      if (data[field] !== undefined) {
        sets.push(`${field} = $${idx++}`);
        values.push(data[field]);
      }
    }

    if (sets.length === 0) return;

    // Auto-marcar fechas según estado
    if (data.estado === "enviada")    { sets.push(`fecha_envio = $${idx++}`);    values.push(new Date()); }
    if (data.estado === "entregada")  { sets.push(`fecha_entrega = $${idx++}`);  values.push(new Date()); }
    if (data.estado === "leida")      { sets.push(`fecha_lectura = $${idx++}`);  values.push(new Date()); }
    if (data.confirmada === true)     { sets.push(`fecha_confirmacion = $${idx++}`); values.push(new Date()); }

    sets.push("updated_at = now()");
    values.push(id);

    await pool.query(
      `UPDATE notificaciones SET ${sets.join(", ")} WHERE id = $${idx}`,
      values
    );
  }

  async remove(id: string): Promise<boolean> {
    const res = await pool.query(
      `DELETE FROM notificaciones WHERE id = $1`,
      [id]
    );
    return (res.rowCount ?? 0) > 0;
  }
}