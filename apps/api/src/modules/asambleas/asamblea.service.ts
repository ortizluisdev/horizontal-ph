import { AsambleaRepository, type PaginatedAsambleas } from "./asamblea.repository.js";
import type { Asamblea } from "@horizontal-ph/types";
import type { AsambleaCreateInput, AsambleaUpdateInput, AsambleaQuery } from "./asamblea.schema.js";

// ─── Singleton ────────────────────────────────────────────────────────────────

const repo = new AsambleaRepository();

// ─── Service ──────────────────────────────────────────────────────────────────

export class AsambleaService {
  // ── List ──────────────────────────────────────────────────────────────────

  async list(query: AsambleaQuery): Promise<PaginatedAsambleas> {
    return repo.list(query);
  }

  // ── Find one ──────────────────────────────────────────────────────────────

  async findById(id: string): Promise<Asamblea | null> {
    return repo.findById(id);
  }

  // ── Create ────────────────────────────────────────────────────────────────

  async create(data: AsambleaCreateInput): Promise<Asamblea> {
    const duplicate = await repo.existsByNumeroActa(data.conjuntoId, data.numero_acta);
    if (duplicate) {
      throw Object.assign(
        new Error("Ya existe una asamblea con ese número de acta en este conjunto"),
        { statusCode: 409 }
      );
    }

    // No se puede programar una asamblea en el pasado
    if (new Date(data.fecha_programada) < new Date()) {
      throw Object.assign(
        new Error("La fecha programada no puede ser en el pasado"),
        { statusCode: 400 }
      );
    }

    return repo.create(data);
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async update(id: string, data: AsambleaUpdateInput): Promise<Asamblea> {
    const existing = await repo.findById(id);
    if (!existing) {
      throw Object.assign(new Error("Asamblea no encontrada"), { statusCode: 404 });
    }

    // No se puede modificar una asamblea cancelada
    if ((existing as any).estado === "cancelada") {
      throw Object.assign(
        new Error("No se puede modificar una asamblea cancelada"),
        { statusCode: 400 }
      );
    }

    // Una asamblea realizada solo puede ser cancelada (por error administrativo)
    if ((existing as any).estado === "realizada" && data.estado && data.estado !== "cancelada") {
      throw Object.assign(
        new Error("Una asamblea realizada solo puede ser marcada como cancelada"),
        { statusCode: 400 }
      );
    }

    // Validar unicidad de numero_acta si se está cambiando
    if (data.numero_acta && data.numero_acta !== (existing as any).numero_acta) {
      const duplicate = await repo.existsByNumeroActa(
        (existing as any).conjunto_id,
        data.numero_acta,
        id
      );
      if (duplicate) {
        throw Object.assign(
          new Error("Ya existe una asamblea con ese número de acta en este conjunto"),
          { statusCode: 409 }
        );
      }
    }

    return (await repo.update(id, data)) as Asamblea;
  }

  // ── Hard delete ───────────────────────────────────────────────────────────

  async remove(id: string): Promise<void> {
    const existing = await repo.findById(id);
    if (!existing) {
      throw Object.assign(new Error("Asamblea no encontrada"), { statusCode: 404 });
    }

    // Solo se pueden eliminar asambleas programadas o canceladas
    const estado = (existing as any).estado as string;
    if (!["programada", "cancelada"].includes(estado)) {
      throw Object.assign(
        new Error("Solo se pueden eliminar asambleas en estado programada o cancelada"),
        { statusCode: 400 }
      );
    }

    await repo.remove(id);
  }
}