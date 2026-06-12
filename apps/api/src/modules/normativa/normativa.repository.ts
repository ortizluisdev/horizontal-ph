import { pool } from "../../core/database/pg.client.js";
import type { Normativa } from "@horizontal-ph/types";
import type { NormativaCreateInput, NormativaUpdateInput, NormativaQuery } from "./normativa.schema.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginatedNormativas {
  data:  Normativa[];
  total: number;
  page:  number;
  limit: number;
  pages: number;
}

// ─── Repository ───────────────────────────────────────────────────────────────

export class NormativaRepository {

  async list(query: NormativaQuery, tenantId: string): Promise<PaginatedNormativas> {
    const { page, limit, conjuntoId, tipo, estado, activo } = query;
    const offset = (page - 1) * limit;

    const conditions: string[] = ["cj.tenant_id = $1"];
    const values: unknown[]    = [tenantId];
    let idx = 2;

    if (conjuntoId) {
      conditions.push(`n.conjunto_id = $${idx++}`);
      values.push(conjuntoId);
    }
    if (tipo) {
      conditions.push(`n.tipo = $${idx++}`);
      values.push(tipo);
    }
    if (estado) {
      conditions.push(`n.estado = $${idx++}`);
      values.push(estado);
    }
    if (activo !== undefined) {
      conditions.push(`n.activo = $${idx++}`);
      values.push(activo);
    }

    const where = `WHERE ${conditions.join(" AND ")}`;

    const [dataRes, countRes] = await Promise.all([
      pool.query<Normativa>(
        `SELECT n.id, n.conjunto_id, n.titulo, n.tipo, n.descripcion,
                n.version, n.estado, n.fecha_vigencia, n.documento_url,
                n.activo, n.created_at, n.updated_at
         FROM normativa n
         INNER JOIN conjuntos cj ON cj.id = n.conjunto_id
         ${where}
         ORDER BY n.created_at DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
        [...values, limit, offset]
      ),
      pool.query<{ total: string }>(
        `SELECT COUNT(*) AS total
         FROM normativa n
         INNER JOIN conjuntos cj ON cj.id = n.conjunto_id
         ${where}`,
        values
      ),
    ]);

    const total = parseInt(countRes.rows[0].total, 10);
    return { data: dataRes.rows, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findById(id: string, tenantId: string): Promise<Normativa | null> {
    const res = await pool.query<Normativa>(
      `SELECT n.id, n.conjunto_id, n.titulo, n.tipo, n.descripcion,
              n.contenido, n.version, n.estado, n.fecha_vigencia,
              n.documento_url, n.activo, n.created_at, n.updated_at
       FROM normativa n
       INNER JOIN conjuntos cj ON cj.id = n.conjunto_id
       WHERE n.id = $1 AND cj.tenant_id = $2
       LIMIT 1`,
      [id, tenantId]
    );
    return res.rows[0] ?? null;
  }

  async create(data: NormativaCreateInput, tenantId: string): Promise<Normativa> {
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
      `INSERT INTO normativa
         (conjunto_id, titulo, tipo, descripcion, contenido, version,
          estado, fecha_vigencia, documento_url, activo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id`,
      [
        data.conjuntoId,
        data.titulo,
        data.tipo,
        data.descripcion   ?? null,
        data.contenido     ?? null,
        data.version       ?? null,
        data.estado        ?? "vigente",
        data.fecha_vigencia ?? null,
        data.documento_url  ?? null,
        data.activo         ?? true,
      ]
    );

    return (await this.findById(res.rows[0].id, tenantId)) as Normativa;
  }

  async update(id: string, data: NormativaUpdateInput, tenantId: string): Promise<Normativa | null> {
    const sets: string[]    = [];
    const values: unknown[] = [];
    let idx = 1;

    const fields: (keyof NormativaUpdateInput)[] = [
      "titulo", "tipo", "descripcion", "contenido",
      "version", "estado", "fecha_vigencia", "documento_url", "activo",
    ];

    for (const field of fields) {
      if (data[field] !== undefined) {
        sets.push(`${field} = $${idx++}`);
        values.push(data[field]);
      }
    }

    if (sets.length === 0) return this.findById(id, tenantId);

    sets.push("updated_at = now()");
    values.push(id);

    await pool.query(
      `UPDATE normativa SET ${sets.join(", ")} WHERE id = $${idx}`,
      values
    );

    return this.findById(id, tenantId);
  }

  async remove(id: string): Promise<boolean> {
    const res = await pool.query(
      `DELETE FROM normativa WHERE id = $1`,
      [id]
    );
    return (res.rowCount ?? 0) > 0;
  }
}