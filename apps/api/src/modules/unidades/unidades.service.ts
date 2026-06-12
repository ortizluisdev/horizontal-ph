import { UnidadRepository, type PaginatedUnidades } from "./unidades.repository.js";
import type { Unidad } from "@horizontal-ph/types";
import type { UnidadCreateInput, UnidadUpdateInput, UnidadQuery } from "./unidades.schema.js";

const repo = new UnidadRepository();

export class UnidadService {
  // ── List ──────────────────────────────────────────────────────────────────

  async list(query: UnidadQuery): Promise<PaginatedUnidades> {
    return repo.list(query);
  }

  async listByConjunto(conjuntoId: string): Promise<Unidad[]> {
    return repo.listByConjunto(conjuntoId);
  }

  // ── Find one ──────────────────────────────────────────────────────────────

  async findById(id: string): Promise<Unidad | null> {
    return repo.findById(id);
  }

  // ── Create ────────────────────────────────────────────────────────────────

  async create(data: UnidadCreateInput): Promise<Unidad> {
    // Validar número de unidad duplicado dentro del conjunto
    if (data.numero_unidad) {
      const duplicate = await repo.existsByConjuntoAndNumero(
        data.conjuntoId,
        data.numero_unidad
      );
      if (duplicate) {
        throw Object.assign(
          new Error("Ya existe una unidad con ese número en este conjunto"),
          { statusCode: 409 }
        );
      }
    }
    return repo.create(data);
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async update(id: string, data: UnidadUpdateInput): Promise<Unidad> {
    const existing = await repo.findById(id);
    if (!existing) {
      throw Object.assign(new Error("Unidad no encontrada"), { statusCode: 404 });
    }

    // Validar duplicado de número solo si cambió
    if (
      data.numero_unidad &&
      data.numero_unidad !== (existing as any).numero_unidad
    ) {
      const conjuntoId = (existing as any).conjunto_id;
      const duplicate  = await repo.existsByConjuntoAndNumero(
        conjuntoId,
        data.numero_unidad,
        id
      );
      if (duplicate) {
        throw Object.assign(
          new Error("Ya existe una unidad con ese número en este conjunto"),
          { statusCode: 409 }
        );
      }
    }

    return (await repo.update(id, data)) as Unidad;
  }

  // ── Deactivate (soft delete) ──────────────────────────────────────────────

  async deactivate(id: string): Promise<Unidad> {
    const result = await repo.deactivate(id);
    if (!result) {
      throw Object.assign(new Error("Unidad no encontrada"), { statusCode: 404 });
    }
    return result;
  }

  // ── Hard delete ───────────────────────────────────────────────────────────

  async remove(id: string): Promise<void> {
    const exists = await repo.findById(id);
    if (!exists) {
      throw Object.assign(new Error("Unidad no encontrada"), { statusCode: 404 });
    }
    await repo.remove(id);
  }
}