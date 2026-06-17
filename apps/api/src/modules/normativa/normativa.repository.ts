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

// ─── Constants ────────────────────────────────────────────────────────────────

const SELECT_COLS = `
  n.id, n.conjunto_id, n.titulo, n.tipo, n.categoria_legal, n.estado, n.alcance,
  n.numero_documento, n.version, n.descripcion, n.contenido,
  n.archivo_url, n.archivo_nombre, n.archivo_tamano,
  n.fecha_emision, n.fecha_vigencia_desde, n.fecha_vigencia_hasta,
  n.asamblea_id, n.aprobado_por,
  COALESCE(n.tags, '{}') AS tags,
  n.activo, n.created_at, n.updated_at
`;

// ─── Repository ───────────────────────────────────────────────────────────────

export class NormativaRepository {

  async list(query: NormativaQuery, tenantId: string): Promise<PaginatedNormativas> {
    const { page, limit, conjuntoId, tipo, estado, categoria_legal, alcance, search, activo } = query;
    const offset = (page - 1) * limit;
    const conditions: string[] = ["cj.tenant_id = $1"];
    const values: unknown[]    = [tenantId];
    let idx = 2;

    if (conjuntoId)      { conditions.push(`n.conjunto_id = $${idx++}`);    values.push(conjuntoId); }
    if (tipo)            { conditions.push(`n.tipo = $${idx++}`);            values.push(tipo); }
    if (estado)          { conditions.push(`n.estado = $${idx++}`);          values.push(estado); }
    if (categoria_legal) { conditions.push(`n.categoria_legal = $${idx++}`); values.push(categoria_legal); }
    if (alcance)         { conditions.push(`n.alcance = $${idx++}`);         values.push(alcance); }
    if (activo !== undefined) {
      conditions.push(`n.activo = $${idx++}`);
      values.push(activo);
    }
    if (search) {
      conditions.push(
        `(n.titulo ILIKE $${idx} OR n.descripcion ILIKE $${idx} OR n.numero_documento ILIKE $${idx})`
      );
      values.push(`%${search}%`);
      idx++;
    }

    const where = `WHERE ${conditions.join(" AND ")}`;

    const [dataRes, countRes] = await Promise.all([
      pool.query<Normativa>(
        `SELECT ${SELECT_COLS}
         FROM normativa n
         INNER JOIN conjuntos cj ON cj.id = n.conjunto_id
         ${where}
         ORDER BY
           CASE n.estado WHEN 'vigente' THEN 0 WHEN 'en_revision' THEN 1 WHEN 'borrador' THEN 2 ELSE 3 END,
           n.created_at DESC
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
      `SELECT ${SELECT_COLS}
       FROM normativa n
       INNER JOIN conjuntos cj ON cj.id = n.conjunto_id
       WHERE n.id = $1 AND cj.tenant_id = $2
       LIMIT 1`,
      [id, tenantId]
    );
    return res.rows[0] ?? null;
  }

  async create(data: NormativaCreateInput, tenantId: string): Promise<Normativa> {
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
         (conjunto_id, titulo, tipo, categoria_legal, estado, alcance,
          numero_documento, version, descripcion, contenido,
          archivo_url, archivo_nombre, archivo_tamano,
          fecha_emision, fecha_vigencia_desde, fecha_vigencia_hasta,
          asamblea_id, aprobado_por, tags, activo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
       RETURNING id`,
      [
        data.conjuntoId,
        data.titulo,
        data.tipo,
        data.categoria_legal      ?? null,
        data.estado               ?? "borrador",
        data.alcance              ?? "todos_propietarios",
        data.numero_documento     ?? null,
        data.version              ?? null,
        data.descripcion          ?? null,
        data.contenido            ?? null,
        data.archivo_url          ?? null,
        data.archivo_nombre       ?? null,
        data.archivo_tamano       ?? null,
        data.fecha_emision        ?? null,
        data.fecha_vigencia_desde ?? null,
        data.fecha_vigencia_hasta ?? null,
        data.asamblea_id          ?? null,
        data.aprobado_por         ?? null,
        data.tags                 ?? [],
        data.activo               ?? true,
      ]
    );

    return (await this.findById(res.rows[0].id, tenantId)) as Normativa;
  }

  async update(id: string, data: NormativaUpdateInput, tenantId: string): Promise<Normativa | null> {
    const sets: string[]    = [];
    const values: unknown[] = [];
    let idx = 1;

    const fieldMap: Array<[string, keyof NormativaUpdateInput]> = [
      ["titulo",               "titulo"],
      ["tipo",                 "tipo"],
      ["categoria_legal",      "categoria_legal"],
      ["estado",               "estado"],
      ["alcance",              "alcance"],
      ["numero_documento",     "numero_documento"],
      ["version",              "version"],
      ["descripcion",          "descripcion"],
      ["contenido",            "contenido"],
      ["archivo_url",          "archivo_url"],
      ["archivo_nombre",       "archivo_nombre"],
      ["archivo_tamano",       "archivo_tamano"],
      ["fecha_emision",        "fecha_emision"],
      ["fecha_vigencia_desde", "fecha_vigencia_desde"],
      ["fecha_vigencia_hasta", "fecha_vigencia_hasta"],
      ["aprobado_por",         "aprobado_por"],
      ["tags",                 "tags"],
      ["activo",               "activo"],
    ];

    for (const [col, key] of fieldMap) {
      if (data[key] !== undefined) {
        sets.push(`${col} = $${idx++}`);
        values.push(data[key]);
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

  async deactivate(id: string): Promise<void> {
    await pool.query(
      `UPDATE normativa SET activo = false, updated_at = now() WHERE id = $1`,
      [id]
    );
  }

  async hardDelete(id: string): Promise<void> {
    await pool.query(`DELETE FROM normativa WHERE id = $1`, [id]);
  }
}
