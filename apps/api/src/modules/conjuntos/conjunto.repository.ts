import { pool } from "../../core/database/pg.client.js";
import type { Conjunto } from "@horizontal-ph/types";
import type { ConjuntoCreateInput, ConjuntoUpdateInput, ConjuntoQuery } from "./conjunto.schema.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginatedConjuntos {
  data:  Conjunto[];
  total: number;
  page:  number;
  limit: number;
  pages: number;
}

// ─── Repository ───────────────────────────────────────────────────────────────

export class ConjuntoRepository {
  // ── List with pagination + filters ───────────────────────────────────────

  async list(query: ConjuntoQuery): Promise<PaginatedConjuntos> {
    const { page, limit, search, tipo_conjunto, activo } = query;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: unknown[]    = [];
    let idx = 1;

    if (search) {
      conditions.push(
        `(nombre ILIKE $${idx} OR direccion ILIKE $${idx} OR ciudad ILIKE $${idx})`
      );
      values.push(`%${search}%`);
      idx++;
    }
    if (tipo_conjunto !== undefined) {
      conditions.push(`tipo_conjunto = $${idx++}`);
      values.push(tipo_conjunto);
    }
    if (activo !== undefined) {
      conditions.push(`activo = $${idx++}`);
      values.push(activo);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [dataRes, countRes] = await Promise.all([
      pool.query<Conjunto>(
        `SELECT id, nombre, direccion, ciudad, tipo_conjunto, activo,
                tenant_id, created_at, updated_at
         FROM conjuntos
         ${where}
         ORDER BY created_at DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
        [...values, limit, offset]
      ),
      pool.query<{ total: string }>(
        `SELECT COUNT(*) AS total FROM conjuntos ${where}`,
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

  async findById(id: string): Promise<Conjunto | null> {
    const res = await pool.query<Conjunto>(
      `SELECT id, nombre, direccion, ciudad, tipo_conjunto, activo,
              tenant_id, created_at, updated_at
       FROM conjuntos
       WHERE id = $1
       LIMIT 1`,
      [id]
    );
    return res.rows[0] ?? null;
  }

  // ── Create ────────────────────────────────────────────────────────────────

  async create(data: ConjuntoCreateInput): Promise<Conjunto> {
    const res = await pool.query<{ id: string }>(
      `INSERT INTO conjuntos (tenant_id, nombre, direccion, ciudad, tipo_conjunto)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        data.tenantId,
        data.nombre,
        data.direccion,
        data.ciudad        ?? null,
        data.tipo_conjunto ?? null,
      ]
    );
    return (await this.findById(res.rows[0].id)) as Conjunto;
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async update(id: string, data: ConjuntoUpdateInput): Promise<Conjunto | null> {
    const sets: string[]   = [];
    const values: unknown[] = [];
    let idx = 1;

    const fields: (keyof ConjuntoUpdateInput)[] = [
      "nombre", "direccion", "ciudad", "tipo_conjunto", "activo",
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
      `UPDATE conjuntos SET ${sets.join(", ")} WHERE id = $${idx}`,
      values
    );

    return this.findById(id);
  }

  // ── Soft delete (desactivar) ──────────────────────────────────────────────

  async deactivate(id: string): Promise<Conjunto | null> {
    const res = await pool.query(
      `UPDATE conjuntos SET activo = false, updated_at = now() WHERE id = $1`,
      [id]
    );
    if ((res.rowCount ?? 0) === 0) return null;
    return this.findById(id);
  }

  // ── Hard delete ───────────────────────────────────────────────────────────

  async remove(id: string): Promise<boolean> {
    const res = await pool.query(
      `DELETE FROM conjuntos WHERE id = $1`,
      [id]
    );
    return (res.rowCount ?? 0) > 0;
  }

  // ── Exists check ─────────────────────────────────────────────────────────

  async existsByTenantAndNombre(
    tenantId: string,
    nombre: string,
    excludeId?: string
  ): Promise<boolean> {
    const res = await pool.query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM conjuntos
         WHERE tenant_id = $1
           AND LOWER(nombre) = LOWER($2)
           ${excludeId ? "AND id <> $3" : ""}
       ) AS exists`,
      excludeId ? [tenantId, nombre, excludeId] : [tenantId, nombre]
    );
    return res.rows[0].exists;
  }
}