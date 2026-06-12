import { pool } from "../../core/database/pg.client.js";
import type { Pqrs } from "@horizontal-ph/types";
import type { PqrsCreateInput, PqrsUpdateInput, PqrsQuery } from "./pqrs.schema.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginatedPqrs {
  data:  Pqrs[];
  total: number;
  page:  number;
  limit: number;
  pages: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateNumeroRadicado(): string {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day   = String(now.getDate()).padStart(2, "0");
  const rand  = Math.floor(Math.random() * 900000) + 100000;
  return `PQRS-${year}${month}${day}-${rand}`;
}

// ─── Repository ───────────────────────────────────────────────────────────────

export class PqrsRepository {

  async list(query: PqrsQuery, tenantId: string): Promise<PaginatedPqrs> {
    const { page, limit, conjuntoId, unidadId, tipo, estado, prioridad, categoria, fechaDesde, fechaHasta, numeroRadicado } = query;
    const offset = (page - 1) * limit;

    const conditions: string[] = ["cj.tenant_id = $1"];
    const values: unknown[]    = [tenantId];
    let idx = 2;

    if (conjuntoId)     { conditions.push(`p.conjunto_id = $${idx++}`);        values.push(conjuntoId); }
    if (unidadId)       { conditions.push(`p.unidad_id = $${idx++}`);          values.push(unidadId); }
    if (tipo)           { conditions.push(`p.tipo = $${idx++}`);               values.push(tipo); }
    if (estado)         { conditions.push(`p.estado = $${idx++}`);             values.push(estado); }
    if (prioridad)      { conditions.push(`p.prioridad = $${idx++}`);          values.push(prioridad); }
    if (categoria)      { conditions.push(`p.categoria = $${idx++}`);          values.push(categoria); }
    if (fechaDesde)     { conditions.push(`p.fecha_radicacion >= $${idx++}`);  values.push(fechaDesde); }
    if (fechaHasta)     { conditions.push(`p.fecha_radicacion <= $${idx++}`);  values.push(fechaHasta); }
    if (numeroRadicado) { conditions.push(`p.numero_radicado ILIKE $${idx++}`); values.push(`%${numeroRadicado}%`); }

    const where = `WHERE ${conditions.join(" AND ")}`;

    const [dataRes, countRes] = await Promise.all([
      pool.query<Pqrs>(
        `SELECT p.id, p.conjunto_id, p.unidad_id, p.usuario_id,
                p.numero_radicado, p.tipo, p.asunto, p.descripcion,
                p.categoria, p.prioridad, p.estado,
                p.fecha_radicacion, p.fecha_respuesta, p.fecha_cierre,
                p.nombre_solicitante, p.email_solicitante,
                p.responsable_asignado_nombre, p.requiere_seguimiento,
                p.fecha_proximo_seguimiento, p.calificacion_satisfaccion,
                p.ubicacion_afectada, p.activo,
                p.created_at, p.updated_at
         FROM pqrs p
         INNER JOIN conjuntos cj ON cj.id = p.conjunto_id
         ${where}
         ORDER BY
           CASE p.prioridad
             WHEN 'urgente' THEN 1
             WHEN 'alta'    THEN 2
             WHEN 'normal'  THEN 3
             WHEN 'baja'    THEN 4
             ELSE 5
           END,
           p.fecha_radicacion DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
        [...values, limit, offset]
      ),
      pool.query<{ total: string }>(
        `SELECT COUNT(*) AS total
         FROM pqrs p
         INNER JOIN conjuntos cj ON cj.id = p.conjunto_id
         ${where}`,
        values
      ),
    ]);

    const total = parseInt(countRes.rows[0].total, 10);
    return { data: dataRes.rows, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findById(id: string, tenantId: string): Promise<Pqrs | null> {
    const res = await pool.query<Pqrs>(
      `SELECT p.*
       FROM pqrs p
       INNER JOIN conjuntos cj ON cj.id = p.conjunto_id
       WHERE p.id = $1 AND cj.tenant_id = $2
       LIMIT 1`,
      [id, tenantId]
    );
    return res.rows[0] ?? null;
  }

  async create(data: PqrsCreateInput, tenantId: string): Promise<Pqrs> {
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

    // Generar número de radicado único con reintentos
    let numero_radicado = generateNumeroRadicado();
    let attempts = 0;
    while (attempts < 5) {
      const exists = await pool.query(
        `SELECT 1 FROM pqrs WHERE numero_radicado = $1 LIMIT 1`,
        [numero_radicado]
      );
      if (!exists.rows[0]) break;
      numero_radicado = generateNumeroRadicado();
      attempts++;
    }

    const res = await pool.query<{ id: string }>(
      `INSERT INTO pqrs (
         conjunto_id, unidad_id, usuario_id, numero_radicado,
         tipo, asunto, descripcion, categoria, prioridad,
         nombre_solicitante, email_solicitante, telefono_solicitante,
         ubicacion_afectada, evidencia_foto_url,
         requiere_seguimiento, fecha_proximo_seguimiento
       ) VALUES (
         $1,$2,$3,$4,
         $5,$6,$7,$8,$9,
         $10,$11,$12,
         $13,$14,
         $15,$16
       ) RETURNING id`,
      [
        data.conjuntoId,
        data.unidadId,
        data.usuarioId             ?? null,
        numero_radicado,
        data.tipo,
        data.asunto,
        data.descripcion,
        data.categoria             ?? null,
        data.prioridad             ?? "normal",
        data.nombre_solicitante    ?? null,
        data.email_solicitante     ?? null,
        data.telefono_solicitante  ?? null,
        data.ubicacion_afectada    ?? null,
        data.evidencia_foto_url    ?? null,
        data.requiere_seguimiento  ?? false,
        data.fecha_proximo_seguimiento ?? null,
      ]
    );

    // Registrar seguimiento inicial
    await pool.query(
      `INSERT INTO pqrs_seguimiento (pqrs_id, accion, descripcion, estado_nuevo)
       VALUES ($1, 'creacion', 'PQRS radicada en el sistema', 'abierta')`,
      [res.rows[0].id]
    );

    return (await this.findById(res.rows[0].id, tenantId)) as Pqrs;
  }

  async update(id: string, data: PqrsUpdateInput, tenantId: string, userId?: string): Promise<Pqrs | null> {
    const current = await this.findById(id, tenantId);
    if (!current) return null;

    const sets: string[]    = [];
    const values: unknown[] = [];
    let idx = 1;

    const fields: (keyof PqrsUpdateInput)[] = [
      "prioridad", "categoria", "responsable_asignado_id",
      "responsable_asignado_nombre", "respuesta_descripcion",
      "requiere_seguimiento", "fecha_proximo_seguimiento",
      "observaciones_internas", "calificacion_satisfaccion",
      "comentario_satisfaccion",
    ];

    for (const field of fields) {
      if (data[field] !== undefined) {
        sets.push(`${field} = $${idx++}`);
        values.push(data[field]);
      }
    }

    // Manejo de cambio de estado con fechas automáticas
    if (data.estado && data.estado !== (current as any).estado) {
      sets.push(`estado = $${idx++}`);
      values.push(data.estado);

      if (data.estado === "resuelta") {
        sets.push(`fecha_respuesta = $${idx++}`);
        values.push(new Date());
      }
      if (["resuelta", "cerrada", "archivada"].includes(data.estado)) {
        sets.push(`fecha_cierre = $${idx++}`);
        values.push(new Date());
        // Calcular tiempo de resolución en días
        const fechaRad = new Date((current as any).fecha_radicacion);
        const dias     = Math.ceil((Date.now() - fechaRad.getTime()) / 86_400_000);
        sets.push(`tiempo_resolucion_dias = $${idx++}`);
        values.push(dias);
      }
    }

    if (sets.length === 0) return current;

    sets.push(`updated_at = now(), updated_by = $${idx++}`);
    values.push(userId ?? null);
    values.push(id);

    await pool.query(
      `UPDATE pqrs SET ${sets.join(", ")} WHERE id = $${idx}`,
      values
    );

    // Registrar seguimiento si cambió el estado
    if (data.estado && data.estado !== (current as any).estado) {
      await pool.query(
        `INSERT INTO pqrs_seguimiento (pqrs_id, accion, descripcion, estado_anterior, estado_nuevo, usuario_id)
         VALUES ($1, 'cambio_estado', $2, $3, $4, $5)`,
        [
          id,
          `Estado cambiado de ${(current as any).estado} a ${data.estado}`,
          (current as any).estado,
          data.estado,
          userId ?? null,
        ]
      );
    }

    return this.findById(id, tenantId);
  }

  async remove(id: string): Promise<boolean> {
    const res = await pool.query(`DELETE FROM pqrs WHERE id = $1`, [id]);
    return (res.rowCount ?? 0) > 0;
  }

  async getSeguimiento(pqrsId: string, tenantId: string) {
    // Primero validar que la PQRS pertenece al tenant
    const pqrs = await this.findById(pqrsId, tenantId);
    if (!pqrs) return null;

    const res = await pool.query(
      `SELECT id, accion, descripcion, estado_anterior, estado_nuevo,
              usuario_nombre, fecha_cambio
       FROM pqrs_seguimiento
       WHERE pqrs_id = $1
       ORDER BY fecha_cambio ASC`,
      [pqrsId]
    );
    return res.rows;
  }
}