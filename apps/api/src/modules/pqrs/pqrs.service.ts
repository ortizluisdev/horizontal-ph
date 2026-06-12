import { PqrsRepository, type PaginatedPqrs } from "./pqrs.repository.js";
import type { Pqrs } from "@horizontal-ph/types";
import type { PqrsCreateInput, PqrsUpdateInput, PqrsQuery } from "./pqrs.schema.js";

// ─── Singleton ────────────────────────────────────────────────────────────────

const repo = new PqrsRepository();

// ─── Service ──────────────────────────────────────────────────────────────────

export class PqrsService {

  async list(query: PqrsQuery, tenantId: string): Promise<PaginatedPqrs> {
    return repo.list(query, tenantId);
  }

  async findById(id: string, tenantId: string): Promise<Pqrs | null> {
    return repo.findById(id, tenantId);
  }

  async getSeguimiento(pqrsId: string, tenantId: string) {
    const result = await repo.getSeguimiento(pqrsId, tenantId);
    if (result === null) {
      throw Object.assign(new Error("PQRS no encontrada"), { statusCode: 404 });
    }
    return result;
  }

  async create(data: PqrsCreateInput, tenantId: string): Promise<Pqrs> {
    return repo.create(data, tenantId);
  }

  async update(id: string, data: PqrsUpdateInput, tenantId: string, userId?: string): Promise<Pqrs> {
    const existing = await repo.findById(id, tenantId);
    if (!existing) {
      throw Object.assign(new Error("PQRS no encontrada"), { statusCode: 404 });
    }

    const estado = (existing as any).estado as string;

    // No se puede modificar una PQRS archivada
    if (estado === "archivada") {
      throw Object.assign(
        new Error("No se puede modificar una PQRS archivada"),
        { statusCode: 400 }
      );
    }

    // Solo se puede calificar si está resuelta o cerrada
    if (data.calificacion_satisfaccion && !["resuelta", "cerrada"].includes(estado)) {
      throw Object.assign(
        new Error("Solo se puede calificar una PQRS resuelta o cerrada"),
        { statusCode: 400 }
      );
    }

    return (await repo.update(id, data, tenantId, userId)) as Pqrs;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const existing = await repo.findById(id, tenantId);
    if (!existing) {
      throw Object.assign(new Error("PQRS no encontrada"), { statusCode: 404 });
    }

    // Solo se pueden eliminar PQRS archivadas
    const estado = (existing as any).estado as string;
    if (estado !== "archivada") {
      throw Object.assign(
        new Error("Solo se pueden eliminar PQRS en estado archivada"),
        { statusCode: 400 }
      );
    }

    await repo.remove(id);
  }
}