import { pool } from '../../core/database/pg.client.js';
import type { Conjunto } from '@horizontal-ph/types';
import type {
  ConjuntoCreateInput,
  ConjuntoUpdateInput,
  ConjuntoQuery,
} from './conjunto.schema.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginatedConjuntos {
  data:  Conjunto[];
  total: number;
  page:  number;
  limit: number;
  pages: number;
}

// ─── Columnas a seleccionar (alineadas con la migración 002) ─────────────────

const SELECT_COLS = `
  id, tenant_id, nombre, direccion, ciudad, departamento, pais,
  codigo_catastral, tipo_conjunto, numero_torres, numero_unidades,
  anio_construccion, area_total_m2, area_comun_m2,
  administrador_nombre, administrador_email, administrador_telefono,
  telefono_emergencia, email_contacto, logo_url,
  activo, created_at, updated_at
`;

// ─── Repository ───────────────────────────────────────────────────────────────

export class ConjuntoRepository {
  // ── List con paginación + filtros ─────────────────────────────────────────

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

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [dataRes, countRes] = await Promise.all([
      pool.query<Conjunto>(
        `SELECT ${SELECT_COLS}
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
      `SELECT ${SELECT_COLS}
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
      `INSERT INTO conjuntos (
         tenant_id, nombre, direccion, ciudad, departamento, pais,
         codigo_catastral, tipo_conjunto, numero_torres, numero_unidades,
         anio_construccion, area_total_m2, area_comun_m2,
         administrador_nombre, administrador_email, administrador_telefono,
         telefono_emergencia, email_contacto, logo_url
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING id`,
      [
        data.tenantId,
        data.nombre,
        data.direccion,
        data.ciudad              ?? null,
        data.departamento        ?? null,
        data.pais                ?? 'Colombia',
        data.codigo_catastral    ?? null,
        data.tipo_conjunto,
        data.numero_torres       ?? null,
        data.numero_unidades     ?? null,
        data.anio_construccion   ?? null,
        data.area_total_m2       ?? null,
        data.area_comun_m2       ?? null,
        data.administrador_nombre     ?? null,
        data.administrador_email      ?? null,
        data.administrador_telefono   ?? null,
        data.telefono_emergencia      ?? null,
        data.email_contacto           ?? null,
        data.logo_url                 ?? null,
      ]
    );
    return (await this.findById(res.rows[0].id)) as Conjunto;
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async update(id: string, data: ConjuntoUpdateInput): Promise<Conjunto | null> {
    const updatableFields: (keyof ConjuntoUpdateInput)[] = [
      'nombre', 'direccion', 'ciudad', 'departamento', 'pais',
      'codigo_catastral', 'tipo_conjunto',
      'numero_torres', 'numero_unidades', 'anio_construccion',
      'area_total_m2', 'area_comun_m2',
      'administrador_nombre', 'administrador_email', 'administrador_telefono',
      'telefono_emergencia', 'email_contacto', 'logo_url',
      'activo',
    ];

    const sets: string[]    = [];
    const values: unknown[] = [];
    let idx = 1;

    for (const field of updatableFields) {
      if (data[field] !== undefined) {
        sets.push(`${field} = $${idx++}`);
        values.push(data[field]);
      }
    }

    if (sets.length === 0) return this.findById(id);

    sets.push('updated_at = now()');
    values.push(id);

    await pool.query(
      `UPDATE conjuntos SET ${sets.join(', ')} WHERE id = $${idx}`,
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

  // ── Exists check ──────────────────────────────────────────────────────────

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
           ${excludeId ? 'AND id <> $3' : ''}
       ) AS exists`,
      excludeId ? [tenantId, nombre, excludeId] : [tenantId, nombre]
    );
    return res.rows[0].exists;
  }
}