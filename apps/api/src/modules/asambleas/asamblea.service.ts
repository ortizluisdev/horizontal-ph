import { AsambleaRepository, type PaginatedAsambleas } from './asamblea.repository.js'
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

const repo = new AsambleaRepository()

export class AsambleaService {
  // ── List ──────────────────────────────────────────────────────────────────

  async list(query: AsambleaQuery, tenantId: string): Promise<PaginatedAsambleas> {
    return repo.list(query, tenantId)
  }

  // ── Find one ──────────────────────────────────────────────────────────────

  async findById(id: string, tenantId: string): Promise<Asamblea | null> {
    return repo.findById(id, tenantId)
  }

  // ── Create ────────────────────────────────────────────────────────────────

  async create(data: AsambleaCreateInput, tenantId: string, userId: string): Promise<Asamblea> {
    const duplicate = await repo.existsByNumeroActa(data.conjuntoId, data.numero_acta)
    if (duplicate) {
      throw Object.assign(
        new Error('Ya existe una asamblea con ese número de acta en este conjunto'),
        { statusCode: 409 }
      )
    }

    if (new Date(data.fecha_programada) < new Date()) {
      throw Object.assign(
        new Error('La fecha programada no puede ser en el pasado'),
        { statusCode: 400 }
      )
    }

    return repo.create(data, userId)
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async update(id: string, data: AsambleaUpdateInput, tenantId: string, userId: string): Promise<Asamblea> {
    const existing = await repo.findById(id, tenantId)
    if (!existing) {
      throw Object.assign(new Error('Asamblea no encontrada'), { statusCode: 404 })
    }

    if (existing.estado === 'cancelada') {
      throw Object.assign(
        new Error('No se puede modificar una asamblea cancelada'),
        { statusCode: 400 }
      )
    }

    if (existing.estado === 'realizada' && data.estado && data.estado !== 'cancelada') {
      throw Object.assign(
        new Error('Una asamblea realizada solo puede ser marcada como cancelada'),
        { statusCode: 400 }
      )
    }

    if (data.numero_acta && data.numero_acta !== existing.numero_acta) {
      const duplicate = await repo.existsByNumeroActa(existing.conjunto_id, data.numero_acta, id)
      if (duplicate) {
        throw Object.assign(
          new Error('Ya existe una asamblea con ese número de acta en este conjunto'),
          { statusCode: 409 }
        )
      }
    }

    return (await repo.update(id, data, userId)) as Asamblea
  }

  // ── Deactivate ────────────────────────────────────────────────────────────

  async deactivate(id: string, tenantId: string, userId: string): Promise<void> {
    const existing = await repo.findById(id, tenantId)
    if (!existing) {
      throw Object.assign(new Error('Asamblea no encontrada'), { statusCode: 404 })
    }
    if (!existing.activo) {
      throw Object.assign(new Error('La asamblea ya está desactivada'), { statusCode: 400 })
    }
    await repo.deactivate(id, userId)
  }

  // ── Hard delete ───────────────────────────────────────────────────────────

  async remove(id: string, tenantId: string): Promise<void> {
    const existing = await repo.findById(id, tenantId)
    if (!existing) {
      throw Object.assign(new Error('Asamblea no encontrada'), { statusCode: 404 })
    }
    if (!['programada', 'cancelada'].includes(existing.estado)) {
      throw Object.assign(
        new Error('Solo se pueden eliminar asambleas en estado programada o cancelada'),
        { statusCode: 400 }
      )
    }
    await repo.remove(id)
  }

  // ── Votaciones ────────────────────────────────────────────────────────────

  async listVotaciones(asambleaId: string, tenantId: string): Promise<AsambleaVotacion[]> {
    const asamblea = await repo.findById(asambleaId, tenantId)
    if (!asamblea) {
      throw Object.assign(new Error('Asamblea no encontrada'), { statusCode: 404 })
    }
    return repo.listVotaciones(asambleaId)
  }

  async createVotacion(asambleaId: string, data: VotacionCreateInput, tenantId: string): Promise<AsambleaVotacion> {
    const asamblea = await repo.findById(asambleaId, tenantId)
    if (!asamblea) {
      throw Object.assign(new Error('Asamblea no encontrada'), { statusCode: 404 })
    }
    if (!['programada', 'en_curso'].includes(asamblea.estado)) {
      throw Object.assign(
        new Error('Solo se pueden agregar votaciones a asambleas programadas o en curso'),
        { statusCode: 400 }
      )
    }
    return repo.createVotacion(asambleaId, data)
  }

  async updateVotacion(asambleaId: string, votacionId: string, data: VotacionUpdateInput, tenantId: string): Promise<AsambleaVotacion> {
    const asamblea = await repo.findById(asambleaId, tenantId)
    if (!asamblea) {
      throw Object.assign(new Error('Asamblea no encontrada'), { statusCode: 404 })
    }
    const updated = await repo.updateVotacion(votacionId, data)
    if (!updated) {
      throw Object.assign(new Error('Votación no encontrada'), { statusCode: 404 })
    }
    return updated
  }

  async deleteVotacion(asambleaId: string, votacionId: string, tenantId: string): Promise<void> {
    const asamblea = await repo.findById(asambleaId, tenantId)
    if (!asamblea) {
      throw Object.assign(new Error('Asamblea no encontrada'), { statusCode: 404 })
    }
    const deleted = await repo.deleteVotacion(votacionId)
    if (!deleted) {
      throw Object.assign(new Error('Votación no encontrada'), { statusCode: 404 })
    }
  }

  // ── Acuerdos ──────────────────────────────────────────────────────────────

  async listAcuerdos(asambleaId: string, tenantId: string): Promise<AsambleaAcuerdo[]> {
    const asamblea = await repo.findById(asambleaId, tenantId)
    if (!asamblea) {
      throw Object.assign(new Error('Asamblea no encontrada'), { statusCode: 404 })
    }
    return repo.listAcuerdos(asambleaId)
  }

  async createAcuerdo(asambleaId: string, data: AcuerdoCreateInput, tenantId: string): Promise<AsambleaAcuerdo> {
    const asamblea = await repo.findById(asambleaId, tenantId)
    if (!asamblea) {
      throw Object.assign(new Error('Asamblea no encontrada'), { statusCode: 404 })
    }
    return repo.createAcuerdo(asambleaId, data)
  }

  async updateAcuerdo(asambleaId: string, acuerdoId: string, data: AcuerdoUpdateInput, tenantId: string): Promise<AsambleaAcuerdo> {
    const asamblea = await repo.findById(asambleaId, tenantId)
    if (!asamblea) {
      throw Object.assign(new Error('Asamblea no encontrada'), { statusCode: 404 })
    }
    const updated = await repo.updateAcuerdo(acuerdoId, data)
    if (!updated) {
      throw Object.assign(new Error('Acuerdo no encontrado'), { statusCode: 404 })
    }
    return updated
  }

  async deleteAcuerdo(asambleaId: string, acuerdoId: string, tenantId: string): Promise<void> {
    const asamblea = await repo.findById(asambleaId, tenantId)
    if (!asamblea) {
      throw Object.assign(new Error('Asamblea no encontrada'), { statusCode: 404 })
    }
    const deleted = await repo.deleteAcuerdo(acuerdoId)
    if (!deleted) {
      throw Object.assign(new Error('Acuerdo no encontrado'), { statusCode: 404 })
    }
  }
}
