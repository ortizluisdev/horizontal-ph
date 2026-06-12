import { pool } from "../../core/database/pg.client.js";
import type { Cobranza } from "@horizontal-ph/types";
import type { CobranzaCreateInput, CobranzaUpdateInput, CobranzaQuery } from "./cobranza.schema.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginatedCobranzas {
  data:  Cobranza[];
  total: number;
  page:  number;
  limit: number;
  pages: number;
}

// ─── Repository ───────────────────────────────────────────────────────────────

export class CobranzaRepository {
  // ── List with pagination + filters ───────────────────────────────────────

  async list(query: CobranzaQuery): Promise<PaginatedCobranzas> {
    const { page, limit, conjuntoId, unidadId, estado, fechaDesde, fechaHasta } = query;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: unknown[]    = [];
    let idx = 1;

    if (conjuntoId) {
      conditions.push(`conjunto_id = $${idx++}`);
      values.push(conjuntoId);
    }
    if (unidadId) {
      conditions.push(`unidad_id = $${idx++}`);
      values.push(unidadId);
    }
    if (estado) {
      conditions.push(`estado = $${idx++}`);
      values.push(estado);
    }
    if (fechaDesde) {
      conditions.push(`fecha_vencimiento >= $${idx++}`);
      values.push(fechaDesde);
    }
    if (fechaHasta) {
      conditions.push(`fecha_vencimiento <= $${idx++}`);
      values.push(fechaHasta);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [dataRes, countRes] = await Promise.all([
      pool.query<Cobranza>(
        `SELECT id, unidad_id, conjunto_id, numero_recibo, concepto,
                valor_total, estado, fecha_vencimiento,
                created_at, updated_at
         FROM cobranza
         ${where}
         ORDER BY fecha_vencimiento DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
        [...values, limit, offset]
      ),
      pool.query<{ total: string }>(
        `SELECT COUNT(*) AS total FROM cobranza ${where}`,
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

  async findById(id: string): Promise<Cobranza | null> {
    const res = await pool.query<Cobranza>(
      `SELECT id, unidad_id, conjunto_id, numero_recibo, concepto,
              valor_total, estado, fecha_vencimiento,
              created_at, updated_at
       FROM cobranza
       WHERE id = $1
       LIMIT 1`,
      [id]
    );
    return res.rows[0] ?? null;
  }

  // ── Create ────────────────────────────────────────────────────────────────

  async create(data: CobranzaCreateInput): Promise<Cobranza> {
    try {
      const res = await pool.query<{ id: string }>(
        `INSERT INTO cobranza
           (unidad_id, conjunto_id, numero_recibo, concepto, valor_total, fecha_vencimiento)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          data.unidadId,
          data.conjuntoId,
          data.numero_recibo,
          data.concepto,
          data.valor_total,
          data.fecha_vencimiento,
        ]
      );
      return (await this.findById(res.rows[0].id)) as Cobranza;
    } catch (err: any) {
      if (err.code === "23505") {
        throw Object.assign(
          new Error("Ya existe una cobranza con ese número de recibo"),
          { statusCode: 409 }
        );
      }
      throw err;
    }
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async update(id: string, data: CobranzaUpdateInput): Promise<Cobranza | null> {
    const sets: string[]    = [];
    const values: unknown[] = [];
    let idx = 1;

    const fields: (keyof CobranzaUpdateInput)[] = [
      "concepto", "valor_total", "fecha_vencimiento", "estado",
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
      `UPDATE cobranza SET ${sets.join(", ")} WHERE id = $${idx}`,
      values
    );

    return this.findById(id);
  }

  // ── Hard delete ───────────────────────────────────────────────────────────

  async remove(id: string): Promise<boolean> {
    const res = await pool.query(
      `DELETE FROM cobranza WHERE id = $1`,
      [id]
    );
    return (res.rowCount ?? 0) > 0;
  }

  // ── Exists check ─────────────────────────────────────────────────────────

  async existsByNumeroRecibo(
    numeroRecibo: string,
    conjuntoId: string,
    excludeId?: string
  ): Promise<boolean> {
    const res = await pool.query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM cobranza
         WHERE numero_recibo = $1
           AND conjunto_id = $2
           ${excludeId ? "AND id <> $3" : ""}
       ) AS exists`,
      excludeId ? [numeroRecibo, conjuntoId, excludeId] : [numeroRecibo, conjuntoId]
    );
    return res.rows[0].exists;
  }
}