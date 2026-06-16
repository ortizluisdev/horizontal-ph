import {
  ConjuntoRepository,
  type PaginatedConjuntos,
} from './conjunto.repository.js';
import type { Conjunto } from '@horizontal-ph/types';
import type {
  ConjuntoCreateInput,
  ConjuntoUpdateInput,
  ConjuntoQuery,
} from './conjunto.schema.js';

const repo = new ConjuntoRepository();

export class ConjuntoService {
  // ── List ──────────────────────────────────────────────────────────────────

  async list(query: ConjuntoQuery): Promise<PaginatedConjuntos> {
    return repo.list(query);
  }

  // ── Find one ──────────────────────────────────────────────────────────────

  async findById(id: string): Promise<Conjunto | null> {
    return repo.findById(id);
  }

  // ── Create ────────────────────────────────────────────────────────────────

  async create(data: ConjuntoCreateInput): Promise<Conjunto> {
    const duplicate = await repo.existsByTenantAndNombre(
      data.tenantId,
      data.nombre
    );
    if (duplicate) {
      throw Object.assign(
        new Error('Ya existe un conjunto con ese nombre en este tenant'),
        { statusCode: 409 }
      );
    }
    return repo.create(data);
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async update(id: string, data: ConjuntoUpdateInput): Promise<Conjunto> {
    const existing = await repo.findById(id);
    if (!existing) {
      throw Object.assign(
        new Error('Conjunto no encontrado'),
        { statusCode: 404 }
      );
    }

    if (data.nombre && data.nombre !== existing.nombre) {
      const duplicate = await repo.existsByTenantAndNombre(
        existing.tenant_id,
        data.nombre,
        id
      );
      if (duplicate) {
        throw Object.assign(
          new Error('Ya existe un conjunto con ese nombre en este tenant'),
          { statusCode: 409 }
        );
      }
    }

    return (await repo.update(id, data)) as Conjunto;
  }

  // ── Deactivate (soft delete) ──────────────────────────────────────────────

  async deactivate(id: string): Promise<Conjunto> {
    const result = await repo.deactivate(id);
    if (!result) {
      throw Object.assign(
        new Error('Conjunto no encontrado'),
        { statusCode: 404 }
      );
    }
    return result;
  }

  // ── Hard delete ───────────────────────────────────────────────────────────

  async remove(id: string): Promise<void> {
    const exists = await repo.findById(id);
    if (!exists) {
      throw Object.assign(
        new Error('Conjunto no encontrado'),
        { statusCode: 404 }
      );
    }
    await repo.remove(id);
  }
}