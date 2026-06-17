import {
  CobranzaRepository,
  type PaginatedCobranzas,
} from './cobranza.repository.js';
import type { Cobranza } from '@horizontal-ph/types';
import type {
  CobranzaCreateInput,
  CobranzaUpdateInput,
  CobranzaQuery,
} from './cobranza.schema.js';

// ─── Tipo local con estado garantizado ───────────────────────────────────────
// Extiende el tipo compartido para asegurar que estado es requerido en este módulo

type CobranzaRow = Cobranza & { estado: string };

// ─── Singleton ────────────────────────────────────────────────────────────────

const repo = new CobranzaRepository();

// ─── Service ──────────────────────────────────────────────────────────────────

export class CobranzaService {
  // ── List ──────────────────────────────────────────────────────────────────

  async list(query: CobranzaQuery): Promise<PaginatedCobranzas> {
    return repo.list(query);
  }

  // ── Find one ──────────────────────────────────────────────────────────────

  async findById(id: string): Promise<Cobranza | null> {
    return repo.findById(id);
  }

  // ── Create ────────────────────────────────────────────────────────────────

  async create(data: CobranzaCreateInput): Promise<Cobranza> {
    const duplicate = await repo.existsByNumeroRecibo(
      data.numero_recibo,
      data.conjuntoId
    );
    if (duplicate) {
      throw Object.assign(
        new Error('Ya existe una cobranza con ese número de recibo en este conjunto'),
        { statusCode: 409 }
      );
    }
    return repo.create(data);
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async update(id: string, data: CobranzaUpdateInput): Promise<Cobranza> {
    const existing = (await repo.findById(id)) as CobranzaRow | null;
    if (!existing) {
      throw Object.assign(
        new Error('Cobranza no encontrada'),
        { statusCode: 404 }
      );
    }

    // No se puede modificar una cobranza cancelada
    if (existing.estado === 'cancelado') {
      throw Object.assign(
        new Error('No se puede modificar una cobranza cancelada'),
        { statusCode: 400 }
      );
    }

    // Una cobranza pagada solo puede cancelarse
    if (existing.estado === 'pagado' && data.estado && data.estado !== 'cancelado') {
      throw Object.assign(
        new Error('Una cobranza pagada solo puede ser cancelada'),
        { statusCode: 400 }
      );
    }

    return (await repo.update(id, data)) as Cobranza;
  }

  // ── Hard delete ───────────────────────────────────────────────────────────

  async remove(id: string): Promise<void> {
    const existing = (await repo.findById(id)) as CobranzaRow | null;
    if (!existing) {
      throw Object.assign(
        new Error('Cobranza no encontrada'),
        { statusCode: 404 }
      );
    }

    if (!['cancelado', 'pendiente'].includes(existing.estado)) {
      throw Object.assign(
        new Error('Solo se pueden eliminar cobranzas en estado pendiente o cancelada'),
        { statusCode: 400 }
      );
    }

    await repo.remove(id);
  }
}