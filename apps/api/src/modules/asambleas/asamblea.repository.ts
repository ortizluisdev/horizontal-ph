import { pool } from '../../core/database/pg.client.js'
import type { Asamblea, AsambleaVotacion, AsambleaAcuerdo } from '@horizontal-ph/types'
import type {
  AsambleaCreateInput,
  AsambleaUpdateInput,
  AsambleaQuery,
  VotacionCreateInput,
  VotacionUpdateInput,
  AcuerdoCreateInput,
  AcuerdoUpdateInput,
} from './asamblea.schema.js'

export interface PaginatedAsambleas {
  data:  Asamblea[]
  total: number
  page:  number
  limit: number
  pages: number
}

const SELECT_COLS = `
  a.id, a.conjunto_id, a.numero_acta, a.tipo, a.asunto, a.descripcion,
  a.fecha_programada, a.fecha_realizada, a.lugar,
  a.presidente_nombre, a.secretario_nombre,
  a.quorum_requerido, a.asistentes_presente, a.asistentes_ausentes, a.representantes,
  a.votacion_requerida, a.estado,
  a.documento_acta_url, a.adjunto_url, a.observaciones,
  a.activo, a.created_at, a.updated_at, a.created_by, a.updated_by
`

export class AsambleaRepository {
  // ── List ─────────────────────────────────────────────────────────────────

  async list(query: AsambleaQuery, tenantId: string): Promise<PaginatedAsambleas> {
    const { page, limit, conjuntoId, tipo, estado, fechaDesde, fechaHasta } = query
    const offset = (page - 1) * limit

    const conditions: string[] = ['cj.tenant_id = $1', 'a.activo = true']
    const values: unknown[]    = [tenantId]
    let idx = 2

    if (conjuntoId) {
      conditions.push(`a.conjunto_id = $${idx++}`)
      values.push(conjuntoId)
    }
    if (tipo) {
      conditions.push(`a.tipo = $${idx++}`)
      values.push(tipo)
    }
    if (estado) {
      conditions.push(`a.estado = $${idx++}`)
      values.push(estado)
    }
    if (fechaDesde) {
      conditions.push(`a.fecha_programada >= $${idx++}`)
      values.push(fechaDesde)
    }
    if (fechaHasta) {
      conditions.push(`a.fecha_programada <= $${idx++}`)
      values.push(fechaHasta)
    }

    const where = `WHERE ${conditions.join(' AND ')}`

    const [dataRes, countRes] = await Promise.all([
      pool.query<Asamblea>(
        `SELECT ${SELECT_COLS}
         FROM asambleas a
         INNER JOIN conjuntos cj ON cj.id = a.conjunto_id
         ${where}
         ORDER BY a.fecha_programada DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
        [...values, limit, offset]
      ),
      pool.query<{ total: string }>(
        `SELECT COUNT(*) AS total
         FROM asambleas a
         INNER JOIN conjuntos cj ON cj.id = a.conjunto_id
         ${where}`,
        values
      ),
    ])

    const total = parseInt(countRes.rows[0].total, 10)
    return { data: dataRes.rows, total, page, limit, pages: Math.ceil(total / limit) }
  }

  // ── Find one ──────────────────────────────────────────────────────────────

  async findById(id: string, tenantId?: string): Promise<Asamblea | null> {
    const tenantCondition = tenantId ? 'AND cj.tenant_id = $2' : ''
    const params          = tenantId ? [id, tenantId] : [id]

    const res = await pool.query<Asamblea>(
      `SELECT ${SELECT_COLS}
       FROM asambleas a
       INNER JOIN conjuntos cj ON cj.id = a.conjunto_id
       WHERE a.id = $1 ${tenantCondition}
       LIMIT 1`,
      params
    )
    return res.rows[0] ?? null
  }

  // ── Create ────────────────────────────────────────────────────────────────

  async create(data: AsambleaCreateInput, userId: string): Promise<Asamblea> {
    try {
      const res = await pool.query<{ id: string }>(
        `INSERT INTO asambleas
           (conjunto_id, numero_acta, tipo, asunto, descripcion,
            fecha_programada, lugar, presidente_nombre, secretario_nombre,
            quorum_requerido, votacion_requerida, observaciones, created_by, updated_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$13)
         RETURNING id`,
        [
          data.conjuntoId,
          data.numero_acta,
          data.tipo,
          data.asunto,
          data.descripcion       ?? null,
          data.fecha_programada,
          data.lugar             ?? null,
          data.presidente_nombre ?? null,
          data.secretario_nombre ?? null,
          data.quorum_requerido  ?? null,
          data.votacion_requerida ?? false,
          data.observaciones     ?? null,
          userId,
        ]
      )
      return (await this.findById(res.rows[0].id)) as Asamblea
    } catch (err: any) {
      if (err.code === '23505') {
        throw Object.assign(
          new Error('Ya existe una asamblea con ese número de acta en este conjunto'),
          { statusCode: 409 }
        )
      }
      throw err
    }
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async update(id: string, data: AsambleaUpdateInput, userId: string): Promise<Asamblea | null> {
    const sets: string[]    = []
    const values: unknown[] = []
    let idx = 1

    const fields: (keyof AsambleaUpdateInput)[] = [
      'numero_acta', 'tipo', 'asunto', 'descripcion',
      'fecha_programada', 'fecha_realizada', 'lugar',
      'presidente_nombre', 'secretario_nombre',
      'quorum_requerido', 'asistentes_presente', 'asistentes_ausentes', 'representantes',
      'votacion_requerida', 'estado',
      'documento_acta_url', 'adjunto_url', 'observaciones',
    ]

    for (const field of fields) {
      if (data[field] !== undefined) {
        sets.push(`${field} = $${idx++}`)
        values.push(data[field])
      }
    }

    if (sets.length === 0) return this.findById(id)

    sets.push(`updated_at = now()`, `updated_by = $${idx++}`)
    values.push(userId, id)

    await pool.query(
      `UPDATE asambleas SET ${sets.join(', ')} WHERE id = $${idx}`,
      values
    )
    return this.findById(id)
  }

  // ── Soft delete ───────────────────────────────────────────────────────────

  async deactivate(id: string, userId: string): Promise<boolean> {
    const res = await pool.query(
      `UPDATE asambleas SET activo = false, updated_at = now(), updated_by = $2 WHERE id = $1`,
      [id, userId]
    )
    return (res.rowCount ?? 0) > 0
  }

  // ── Hard delete ───────────────────────────────────────────────────────────

  async remove(id: string): Promise<boolean> {
    const res = await pool.query(`DELETE FROM asambleas WHERE id = $1`, [id])
    return (res.rowCount ?? 0) > 0
  }

  // ── Duplicate check ───────────────────────────────────────────────────────

  async existsByNumeroActa(conjuntoId: string, numeroActa: string, excludeId?: string): Promise<boolean> {
    const res = await pool.query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM asambleas
         WHERE conjunto_id = $1
           AND LOWER(numero_acta) = LOWER($2)
           AND activo = true
           ${excludeId ? 'AND id <> $3' : ''}
       ) AS exists`,
      excludeId ? [conjuntoId, numeroActa, excludeId] : [conjuntoId, numeroActa]
    )
    return res.rows[0].exists
  }

  // ── Votaciones ────────────────────────────────────────────────────────────

  async listVotaciones(asambleaId: string): Promise<AsambleaVotacion[]> {
    const res = await pool.query<AsambleaVotacion>(
      `SELECT id, asamblea_id, numero_votacion, tema, descripcion,
              votos_a_favor, votos_en_contra, abstenciones, resultado,
              observaciones, created_at
       FROM asamblea_votaciones
       WHERE asamblea_id = $1
       ORDER BY numero_votacion`,
      [asambleaId]
    )
    return res.rows
  }

  async createVotacion(asambleaId: string, data: VotacionCreateInput): Promise<AsambleaVotacion> {
    const res = await pool.query<AsambleaVotacion>(
      `INSERT INTO asamblea_votaciones
         (asamblea_id, numero_votacion, tema, descripcion,
          votos_a_favor, votos_en_contra, abstenciones, resultado, observaciones)
       VALUES (
         $1,
         (SELECT COALESCE(MAX(numero_votacion), 0) + 1 FROM asamblea_votaciones WHERE asamblea_id = $1),
         $2, $3, $4, $5, $6, $7, $8
       )
       RETURNING *`,
      [
        asambleaId,
        data.tema,
        data.descripcion     ?? null,
        data.votos_a_favor   ?? 0,
        data.votos_en_contra ?? 0,
        data.abstenciones    ?? 0,
        data.resultado       ?? null,
        data.observaciones   ?? null,
      ]
    )
    return res.rows[0]
  }

  async updateVotacion(votacionId: string, data: VotacionUpdateInput): Promise<AsambleaVotacion | null> {
    const sets: string[]    = []
    const values: unknown[] = []
    let idx = 1

    const fields: (keyof VotacionUpdateInput)[] = [
      'tema', 'descripcion', 'votos_a_favor', 'votos_en_contra',
      'abstenciones', 'resultado', 'observaciones',
    ]
    for (const field of fields) {
      if (data[field] !== undefined) {
        sets.push(`${field} = $${idx++}`)
        values.push(data[field])
      }
    }
    if (sets.length === 0) {
      const res = await pool.query<AsambleaVotacion>(`SELECT * FROM asamblea_votaciones WHERE id = $1`, [votacionId])
      return res.rows[0] ?? null
    }
    values.push(votacionId)
    const res = await pool.query<AsambleaVotacion>(
      `UPDATE asamblea_votaciones SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )
    return res.rows[0] ?? null
  }

  async deleteVotacion(votacionId: string): Promise<boolean> {
    const res = await pool.query(`DELETE FROM asamblea_votaciones WHERE id = $1`, [votacionId])
    return (res.rowCount ?? 0) > 0
  }

  // ── Acuerdos ──────────────────────────────────────────────────────────────

  async listAcuerdos(asambleaId: string): Promise<AsambleaAcuerdo[]> {
    const res = await pool.query<AsambleaAcuerdo>(
      `SELECT id, asamblea_id, numero_acuerdo, descripcion,
              responsable_nombre, responsable_id, fecha_vencimiento,
              estado, observaciones, created_at, updated_at
       FROM asamblea_acuerdos
       WHERE asamblea_id = $1
       ORDER BY numero_acuerdo`,
      [asambleaId]
    )
    return res.rows
  }

  async createAcuerdo(asambleaId: string, data: AcuerdoCreateInput): Promise<AsambleaAcuerdo> {
    const res = await pool.query<AsambleaAcuerdo>(
      `INSERT INTO asamblea_acuerdos
         (asamblea_id, numero_acuerdo, descripcion, responsable_nombre, fecha_vencimiento, observaciones)
       VALUES (
         $1,
         (SELECT COALESCE(MAX(numero_acuerdo), 0) + 1 FROM asamblea_acuerdos WHERE asamblea_id = $1),
         $2, $3, $4, $5
       )
       RETURNING *`,
      [
        asambleaId,
        data.descripcion,
        data.responsable_nombre ?? null,
        data.fecha_vencimiento  ?? null,
        data.observaciones      ?? null,
      ]
    )
    return res.rows[0]
  }

  async updateAcuerdo(acuerdoId: string, data: AcuerdoUpdateInput): Promise<AsambleaAcuerdo | null> {
    const sets: string[]    = []
    const values: unknown[] = []
    let idx = 1

    const fields: (keyof AcuerdoUpdateInput)[] = [
      'descripcion', 'responsable_nombre', 'fecha_vencimiento', 'estado', 'observaciones',
    ]
    for (const field of fields) {
      if (data[field] !== undefined) {
        sets.push(`${field} = $${idx++}`)
        values.push(data[field])
      }
    }
    if (sets.length === 0) {
      const res = await pool.query<AsambleaAcuerdo>(`SELECT * FROM asamblea_acuerdos WHERE id = $1`, [acuerdoId])
      return res.rows[0] ?? null
    }
    sets.push(`updated_at = now()`)
    values.push(acuerdoId)
    const res = await pool.query<AsambleaAcuerdo>(
      `UPDATE asamblea_acuerdos SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )
    return res.rows[0] ?? null
  }

  async deleteAcuerdo(acuerdoId: string): Promise<boolean> {
    const res = await pool.query(`DELETE FROM asamblea_acuerdos WHERE id = $1`, [acuerdoId])
    return (res.rowCount ?? 0) > 0
  }
}
