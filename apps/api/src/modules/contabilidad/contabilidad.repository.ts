import { pool } from "../../core/database/pg.client.js";
import type { MovimientoContable } from "@horizontal-ph/types";
import type {
  MovimientoCreateInput,
  MovimientoUpdateInput,
  MovimientoQuery,
} from "./contabilidad.schema.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginatedMovimientos {
  data:          MovimientoContable[];
  total:         number;
  page:          number;
  limit:         number;
  pages:         number;
  total_debitos: number;
  total_creditos: number;
}

// ─── Repository ───────────────────────────────────────────────────────────────

export class ContabilidadRepository {
  // ── Columnas base (evita SELECT *) ────────────────────────────────────────

  private readonly BASE_COLUMNS = `
    id, conjunto_id, numero_asiento, tipo_movimiento, categoria,
    valor_debit, valor_credit, descripcion, fecha_movimiento,
    referencia_externa, unidad_id, cobranza_id,
    estado, motivo_anulacion,
    created_at, updated_at
  `;

  // ── List with pagination + filters + totals ───────────────────────────────

  async list(query: MovimientoQuery): Promise<PaginatedMovimientos> {
    const {
      page, limit, conjuntoId, tipo_movimiento,
      categoria, estado, fechaDesde, fechaHasta, unidad_id,
    } = query;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: unknown[]    = [];
    let idx = 1;

    if (conjuntoId) {
      conditions.push(`conjunto_id = $${idx++}`);
      values.push(conjuntoId);
    }
    if (tipo_movimiento) {
      conditions.push(`tipo_movimiento = $${idx++}`);
      values.push(tipo_movimiento);
    }
    if (categoria) {
      conditions.push(`categoria = $${idx++}`);
      values.push(categoria);
    }
    if (estado) {
      conditions.push(`estado = $${idx++}`);
      values.push(estado);
    }
    if (fechaDesde) {
      conditions.push(`fecha_movimiento >= $${idx++}`);
      values.push(fechaDesde);
    }
    if (fechaHasta) {
      conditions.push(`fecha_movimiento <= $${idx++}`);
      values.push(fechaHasta);
    }
    if (unidad_id) {
      conditions.push(`unidad_id = $${idx++}`);
      values.push(unidad_id);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [dataRes, summaryRes] = await Promise.all([
      pool.query<MovimientoContable>(
        `SELECT ${this.BASE_COLUMNS}
         FROM contabilidad
         ${where}
         ORDER BY fecha_movimiento DESC, created_at DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
        [...values, limit, offset]
      ),
      pool.query<{ total: string; total_debitos: string; total_creditos: string }>(
        `SELECT
           COUNT(*)            AS total,
           COALESCE(SUM(valor_debit),  0) AS total_debitos,
           COALESCE(SUM(valor_credit), 0) AS total_creditos
         FROM contabilidad
         ${where}`,
        values
      ),
    ]);

    const { total, total_debitos, total_creditos } = summaryRes.rows[0];
    const totalCount = parseInt(total, 10);

    return {
      data:           dataRes.rows,
      total:          totalCount,
      page,
      limit,
      pages:          Math.ceil(totalCount / limit),
      total_debitos:  parseFloat(total_debitos),
      total_creditos: parseFloat(total_creditos),
    };
  }

  // ── Find one ──────────────────────────────────────────────────────────────

  async findById(id: string): Promise<MovimientoContable | null> {
    const res = await pool.query<MovimientoContable>(
      `SELECT ${this.BASE_COLUMNS} FROM contabilidad WHERE id = $1 LIMIT 1`,
      [id]
    );
    return res.rows[0] ?? null;
  }

  // ── Create ────────────────────────────────────────────────────────────────

  async create(data: MovimientoCreateInput): Promise<MovimientoContable> {
    try {
      const res = await pool.query<{ id: string }>(
        `INSERT INTO contabilidad (
           conjunto_id, numero_asiento, tipo_movimiento, categoria,
           valor_debit, valor_credit, descripcion, fecha_movimiento,
           referencia_externa, unidad_id, cobranza_id
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING id`,
        [
          data.conjuntoId,
          data.numero_asiento,
          data.tipo_movimiento,
          data.categoria,
          data.valor_debit  ?? 0,
          data.valor_credit ?? 0,
          data.descripcion            ?? null,
          data.fecha_movimiento,
          data.referencia_externa     ?? null,
          data.unidad_id              ?? null,
          data.cobranza_id            ?? null,
        ]
      );
      return (await this.findById(res.rows[0].id)) as MovimientoContable;
    } catch (err: any) {
      if (err.code === "23505") {
        throw Object.assign(
          new Error("Ya existe un movimiento con ese número de asiento en este conjunto"),
          { statusCode: 409 }
        );
      }
      throw err;
    }
  }

  // ── Update (solo campos editables) ───────────────────────────────────────

  async update(id: string, data: MovimientoUpdateInput): Promise<MovimientoContable | null> {
    const sets: string[]    = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.descripcion !== undefined) {
      sets.push(`descripcion = $${idx++}`);
      values.push(data.descripcion);
    }
    if (data.referencia_externa !== undefined) {
      sets.push(`referencia_externa = $${idx++}`);
      values.push(data.referencia_externa);
    }

    if (sets.length === 0) return this.findById(id);

    sets.push("updated_at = now()");
    values.push(id);

    await pool.query(
      `UPDATE contabilidad SET ${sets.join(", ")} WHERE id = $${idx}`,
      values
    );

    return this.findById(id);
  }

  // ── Anular (soft delete contable) ─────────────────────────────────────────

  async anular(id: string, motivo: string): Promise<MovimientoContable | null> {
    const res = await pool.query(
      `UPDATE contabilidad
       SET estado = 'anulado', motivo_anulacion = $1, updated_at = now()
       WHERE id = $2`,
      [motivo, id]
    );
    if ((res.rowCount ?? 0) === 0) return null;
    return this.findById(id);
  }

  // ── Exists check ─────────────────────────────────────────────────────────

  async existsByNumeroAsiento(
    conjuntoId: string,
    numeroAsiento: string,
    excludeId?: string
  ): Promise<boolean> {
    const res = await pool.query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM contabilidad
         WHERE conjunto_id = $1
           AND LOWER(numero_asiento) = LOWER($2)
           ${excludeId ? "AND id <> $3" : ""}
       ) AS exists`,
      excludeId ? [conjuntoId, numeroAsiento, excludeId] : [conjuntoId, numeroAsiento]
    );
    return res.rows[0].exists;
  }

  // ── Balance por período ───────────────────────────────────────────────────

  async getBalance(
    conjuntoId: string,
    fechaDesde: string,
    fechaHasta: string
  ): Promise<{ total_debitos: number; total_creditos: number; saldo: number }> {
    const res = await pool.query<{
      total_debitos: string;
      total_creditos: string;
    }>(
      `SELECT
         COALESCE(SUM(valor_debit),  0) AS total_debitos,
         COALESCE(SUM(valor_credit), 0) AS total_creditos
       FROM contabilidad
       WHERE conjunto_id = $1
         AND fecha_movimiento BETWEEN $2 AND $3
         AND estado = 'activo'`,
      [conjuntoId, fechaDesde, fechaHasta]
    );

    const debitos  = parseFloat(res.rows[0].total_debitos);
    const creditos = parseFloat(res.rows[0].total_creditos);

    return {
      total_debitos:  debitos,
      total_creditos: creditos,
      saldo:          debitos - creditos,
    };
  }
}