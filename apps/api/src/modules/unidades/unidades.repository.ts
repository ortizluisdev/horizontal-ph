import { pool } from "../../core/database/pg.client.js";
import type { Unidad } from "@horizontal-ph/types";
import type { UnidadCreateInput, UnidadUpdateInput, UnidadQuery } from "./unidades.schema.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginatedUnidades {
  data:  Unidad[];
  total: number;
  page:  number;
  limit: number;
  pages: number;
}

// ─── Repository ───────────────────────────────────────────────────────────────

export class UnidadRepository {
  // ── List with pagination + filters ───────────────────────────────────────

  async list(query: UnidadQuery): Promise<PaginatedUnidades> {
    const { page, limit, search, conjuntoId, tipo_unidad, activo, piso } = query;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: unknown[]    = [];
    let idx = 1;

    if (search) {
      conditions.push(
        `(u.nombre ILIKE $${idx} OR u.descripcion ILIKE $${idx} OR u.numero_unidad ILIKE $${idx})`
      );
      values.push(`%${search}%`);
      idx++;
    }
    if (conjuntoId) {
      conditions.push(`u.conjunto_id = $${idx++}`);
      values.push(conjuntoId);
    }
    if (tipo_unidad !== undefined) {
      conditions.push(`u.tipo_unidad = $${idx++}`);
      values.push(tipo_unidad);
    }
    if (activo !== undefined) {
      conditions.push(`u.activo = $${idx++}`);
      values.push(activo);
    }
    if (piso !== undefined) {
      conditions.push(`u.piso = $${idx++}`);
      values.push(piso);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [dataRes, countRes] = await Promise.all([
      pool.query<Unidad>(
        `SELECT
           u.id, u.nombre, u.descripcion,
           u.conjunto_id, c.nombre AS conjunto_nombre,
           u.tipo_unidad, u.numero_unidad, u.piso, u.area_m2,
           u.activo, u.created_at, u.updated_at
         FROM unidades u
         LEFT JOIN conjuntos c ON c.id = u.conjunto_id
         ${where}
         ORDER BY u.nombre ASC
         LIMIT $${idx++} OFFSET $${idx++}`,
        [...values, limit, offset]
      ),
      pool.query<{ total: string }>(
        `SELECT COUNT(*) AS total FROM unidades u ${where}`,
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

  async findById(id: string): Promise<Unidad | null> {
    const res = await pool.query<Unidad>(
      `SELECT
         u.id, u.nombre, u.descripcion,
         u.conjunto_id, c.nombre AS conjunto_nombre,
         u.tipo_unidad, u.numero_unidad, u.piso, u.area_m2,
         u.activo, u.created_at, u.updated_at
       FROM unidades u
       LEFT JOIN conjuntos c ON c.id = u.conjunto_id
       WHERE u.id = $1
       LIMIT 1`,
      [id]
    );
    return res.rows[0] ?? null;
  }

  // ── Create ────────────────────────────────────────────────────────────────

  async create(data: UnidadCreateInput): Promise<Unidad> {
    const res = await pool.query<{ id: string }>(
      `INSERT INTO unidades
         (conjunto_id, nombre, descripcion, tipo_unidad, numero_unidad, piso, area_m2)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        data.conjuntoId,
        data.nombre,
        data.descripcion   ?? null,
        data.tipo_unidad   ?? null,
        data.numero_unidad ?? null,
        data.piso          ?? null,
        data.area_m2       ?? null,
      ]
    );
    return (await this.findById(res.rows[0].id)) as Unidad;
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async update(id: string, data: UnidadUpdateInput): Promise<Unidad | null> {
    const sets: string[]    = [];
    const values: unknown[] = [];
    let idx = 1;

    const fields: (keyof UnidadUpdateInput)[] = [
      "nombre", "descripcion", "tipo_unidad", "numero_unidad", "piso", "area_m2", "activo",
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
      `UPDATE unidades SET ${sets.join(", ")} WHERE id = $${idx}`,
      values
    );

    return this.findById(id);
  }

  // ── Soft delete ───────────────────────────────────────────────────────────

  async deactivate(id: string): Promise<Unidad | null> {
    const res = await pool.query(
      `UPDATE unidades SET activo = false, updated_at = now() WHERE id = $1`,
      [id]
    );
    if ((res.rowCount ?? 0) === 0) return null;
    return this.findById(id);
  }

  // ── Hard delete ───────────────────────────────────────────────────────────

  async remove(id: string): Promise<boolean> {
    const res = await pool.query(`DELETE FROM unidades WHERE id = $1`, [id]);
    return (res.rowCount ?? 0) > 0;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  async existsByConjuntoAndNumero(
    conjuntoId: string,
    numero_unidad: string,
    excludeId?: string
  ): Promise<boolean> {
    const res = await pool.query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM unidades
         WHERE conjunto_id = $1
           AND LOWER(numero_unidad) = LOWER($2)
           ${excludeId ? "AND id <> $3" : ""}
       ) AS exists`,
      excludeId ? [conjuntoId, numero_unidad, excludeId] : [conjuntoId, numero_unidad]
    );
    return res.rows[0].exists;
  }

  async listByConjunto(conjuntoId: string): Promise<Unidad[]> {
    const res = await pool.query<Unidad>(
      `SELECT
         u.id, u.nombre, u.descripcion,
         u.conjunto_id, u.tipo_unidad, u.numero_unidad, u.piso, u.area_m2,
         u.activo, u.created_at, u.updated_at
       FROM unidades u
       WHERE u.conjunto_id = $1
       ORDER BY u.piso ASC, u.nombre ASC`,
      [conjuntoId]
    );
    return res.rows;
  }
}