import { pool } from '../../core/database/pg.client.js';
import type { Cobranza } from '@horizontal-ph/types';
import type {
  CobranzaCreateInput,
  CobranzaUpdateInput,
  CobranzaQuery,
} from './cobranza.schema.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginatedCobranzas {
  data:  Cobranza[];
  total: number;
  page:  number;
  limit: number;
  pages: number;
}

// ─── Columnas a seleccionar (alineadas con migración 004) ────────────────────

const SELECT_COLS = `
  id, unidad_id, conjunto_id, numero_recibo, concepto, descripcion,
  valor_base, valor_impuesto, valor_total, valor_pagado, valor_deuda,
  mes_facturacion, anio_facturacion,
  fecha_emision, fecha_vencimiento, fecha_pago,
  metodo_pago, estado, referencia_pago, observaciones,
  enviado_cobrador, fecha_envio_cobrador, activo,
  created_at, updated_at
`;

// ─── Repository ───────────────────────────────────────────────────────────────

export class CobranzaRepository {
  // ── List con paginación + filtros ─────────────────────────────────────────

  async list(query: CobranzaQuery): Promise<PaginatedCobranzas> {
    const { page, limit, conjuntoId, unidadId, estado, fechaDesde, fechaHasta, search } = query;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['activo = true'];
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
    if (search) {
      conditions.push(
        `(numero_recibo ILIKE $${idx} OR concepto ILIKE $${idx} OR descripcion ILIKE $${idx})`
      );
      values.push(`%${search}%`);
      idx++;
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const [dataRes, countRes] = await Promise.all([
      pool.query<Cobranza>(
        `SELECT ${SELECT_COLS}
         FROM cobranza
         ${where}
         ORDER BY fecha_vencimiento DESC, created_at DESC
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
      `SELECT ${SELECT_COLS}
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
        `INSERT INTO cobranza (
           unidad_id, conjunto_id, numero_recibo, concepto, descripcion,
           valor_base, valor_impuesto, valor_total,
           mes_facturacion, anio_facturacion,
           fecha_emision, fecha_vencimiento
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING id`,
        [
          data.unidadId,
          data.conjuntoId,
          data.numero_recibo,
          data.concepto,
          data.descripcion       ?? null,
          data.valor_base,
          data.valor_impuesto    ?? 0,
          data.valor_total,
          data.mes_facturacion   ?? null,
          data.anio_facturacion  ?? null,
          data.fecha_emision     ?? new Date().toISOString().slice(0, 10),
          data.fecha_vencimiento,
        ]
      );
      return (await this.findById(res.rows[0].id)) as Cobranza;
    } catch (err: any) {
      if (err.code === '23505') {
        throw Object.assign(
          new Error('Ya existe una cobranza con ese número de recibo'),
          { statusCode: 409 }
        );
      }
      throw err;
    }
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async update(id: string, data: CobranzaUpdateInput): Promise<Cobranza | null> {
    const updatableFields: (keyof CobranzaUpdateInput)[] = [
      'concepto', 'descripcion',
      'valor_base', 'valor_impuesto', 'valor_total', 'valor_pagado',
      'fecha_vencimiento', 'fecha_pago',
      'metodo_pago', 'referencia_pago', 'observaciones', 'estado',
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

    // Recalcular valor_deuda automáticamente si se actualiza valor_total o valor_pagado
    if (data.valor_total !== undefined || data.valor_pagado !== undefined) {
      sets.push(`valor_deuda = GREATEST(0, valor_total - COALESCE(valor_pagado, 0))`);
    }

    if (sets.length === 0) return this.findById(id);

    sets.push('updated_at = now()');
    values.push(id);

    await pool.query(
      `UPDATE cobranza SET ${sets.join(', ')} WHERE id = $${idx}`,
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

  // ── Exists check por número de recibo ────────────────────────────────────

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
           ${excludeId ? 'AND id <> $3' : ''}
       ) AS exists`,
      excludeId ? [numeroRecibo, conjuntoId, excludeId] : [numeroRecibo, conjuntoId]
    );
    return res.rows[0].exists;
  }
}