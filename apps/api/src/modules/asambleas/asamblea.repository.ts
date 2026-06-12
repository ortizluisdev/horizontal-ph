import { pool } from "../../core/database/pg.client.js";
import type { Asamblea } from "@horizontal-ph/types";
import type { AsambleaCreateInput, AsambleaUpdateInput, AsambleaQuery } from "./asamblea.schema.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginatedAsambleas {
  data:  Asamblea[];
  total: number;
  page:  number;
  limit: number;
  pages: number;
}

// ─── Repository ───────────────────────────────────────────────────────────────

export class AsambleaRepository {
  // ── List with pagination + filters ───────────────────────────────────────

  async list(query: AsambleaQuery): Promise<PaginatedAsambleas> {
    const { page, limit, conjuntoId, tipo, estado, fechaDesde, fechaHasta } = query;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: unknown[]    = [];
    let idx = 1;

    if (conjuntoId) {
      conditions.push(`conjunto_id = $${idx++}`);
      values.push(conjuntoId);
    }
    if (tipo) {
      conditions.push(`tipo = $${idx++}`);
      values.push(tipo);
    }
    if (estado) {
      conditions.push(`estado = $${idx++}`);
      values.push(estado);
    }
    if (fechaDesde) {
      conditions.push(`fecha_programada >= $${idx++}`);
      values.push(fechaDesde);
    }
    if (fechaHasta) {
      conditions.push(`fecha_programada <= $${idx++}`);
      values.push(fechaHasta);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [dataRes, countRes] = await Promise.all([
      pool.query<Asamblea>(
        `SELECT id, conjunto_id, numero_acta, tipo, asunto,
                fecha_programada, lugar, quorum_requerido,
                estado, notas, created_at, updated_at
         FROM asambleas
         ${where}
         ORDER BY fecha_programada DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
        [...values, limit, offset]
      ),
      pool.query<{ total: string }>(
        `SELECT COUNT(*) AS total FROM asambleas ${where}`,
        values
      ),
    ]);

    const total = parseInt(countRes.rows[0].total, 10);

    return {
      data:  dataRes.rows,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  // ── Find one ──────────────────────────────────────────────────────────────

  async findById(id: string): Promise<Asamblea | null> {
    const res = await pool.query<Asamblea>(
      `SELECT id, conjunto_id, numero_acta, tipo, asunto,
              fecha_programada, lugar, quorum_requerido,
              estado, notas, created_at, updated_at
       FROM asambleas
       WHERE id = $1
       LIMIT 1`,
      [id]
    );
    return res.rows[0] ?? null;
  }

  // ── Create ────────────────────────────────────────────────────────────────

  async create(data: AsambleaCreateInput): Promise<Asamblea> {
    try {
      const res = await pool.query<{ id: string }>(
        `INSERT INTO asambleas
           (conjunto_id, numero_acta, tipo, asunto, fecha_programada,
            lugar, quorum_requerido, notas)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          data.conjuntoId,
          data.numero_acta,
          data.tipo,
          data.asunto,
          data.fecha_programada,
          data.lugar            ?? null,
          data.quorum_requerido ?? null,
          data.notas            ?? null,
        ]
      );
      return (await this.findById(res.rows[0].id)) as Asamblea;
    } catch (err: any) {
      if (err.code === "23505") {
        throw Object.assign(
          new Error("Ya existe una asamblea con ese número de acta en este conjunto"),
          { statusCode: 409 }
        );
      }
      throw err;
    }
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async update(id: string, data: AsambleaUpdateInput): Promise<Asamblea | null> {
    const sets: string[]    = [];
    const values: unknown[] = [];
    let idx = 1;

    const fields: (keyof AsambleaUpdateInput)[] = [
      "numero_acta", "tipo", "asunto", "fecha_programada",
      "lugar", "quorum_requerido", "notas", "estado",
    ];

    for (const field of fields) {
      if (data[field] !== undefined) {
        sets.push(`${field} = $${idx++}`);
        values.push(data[field]);
      }
    }

    if (sets.length === 0) return this.findById(id);

    sets.push("updated_at = now()");
    values.push(id);

    await pool.query(
      `UPDATE asambleas SET ${sets.join(", ")} WHERE id = $${idx}`,
      values
    );

    return this.findById(id);
  }

  // ── Hard delete ───────────────────────────────────────────────────────────

  async remove(id: string): Promise<boolean> {
    const res = await pool.query(
      `DELETE FROM asambleas WHERE id = $1`,
      [id]
    );
    return (res.rowCount ?? 0) > 0;
  }

  // ── Exists check ─────────────────────────────────────────────────────────

  async existsByNumeroActa(
    conjuntoId: string,
    numeroActa: string,
    excludeId?: string
  ): Promise<boolean> {
    const res = await pool.query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM asambleas
         WHERE conjunto_id = $1
           AND LOWER(numero_acta) = LOWER($2)
           ${excludeId ? "AND id <> $3" : ""}
       ) AS exists`,
      excludeId ? [conjuntoId, numeroActa, excludeId] : [conjuntoId, numeroActa]
    );
    return res.rows[0].exists;
  }
}