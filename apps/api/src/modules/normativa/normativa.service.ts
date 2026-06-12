import { NormativaRepository, type PaginatedNormativas } from "./normativa.repository.js";
import type { Normativa } from "@horizontal-ph/types";
import type { NormativaCreateInput, NormativaUpdateInput, NormativaQuery } from "./normativa.schema.js";

// ─── Singleton ────────────────────────────────────────────────────────────────

const repo = new NormativaRepository();

// ─── Service ──────────────────────────────────────────────────────────────────

export class NormativaService {

  async list(query: NormativaQuery, tenantId: string): Promise<PaginatedNormativas> {
    return repo.list(query, tenantId);
  }

  async findById(id: string, tenantId: string): Promise<Normativa | null> {
    return repo.findById(id, tenantId);
  }

  async create(data: NormativaCreateInput, tenantId: string): Promise<Normativa> {
    return repo.create(data, tenantId);
  }

  async update(id: string, data: NormativaUpdateInput, tenantId: string): Promise<Normativa> {
    const existing = await repo.findById(id, tenantId);
    if (!existing) {
      throw Object.assign(new Error("Normativa no encontrada"), { statusCode: 404 });
    }

    // Una normativa derogada o archivada no se puede editar
    if (["derogada", "archivada"].includes((existing as any).estado)) {
      throw Object.assign(
        new Error("No se puede modificar una normativa derogada o archivada"),
        { statusCode: 400 }
      );
    }

    return (await repo.update(id, data, tenantId)) as Normativa;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const existing = await repo.findById(id, tenantId);
    if (!existing) {
      throw Object.assign(new Error("Normativa no encontrada"), { statusCode: 404 });
    }

    // Solo se pueden eliminar borradores o archivadas
    const estado = (existing as any).estado as string;
    if (!["borrador", "archivada"].includes(estado)) {
      throw Object.assign(
        new Error("Solo se pueden eliminar normativas en estado borrador o archivada"),
        { statusCode: 400 }
      );
    }

    await repo.remove(id);
  }
}