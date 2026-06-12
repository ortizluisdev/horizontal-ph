import { CobranzaRepository, type PaginatedCobranzas } from "./cobranza.repository.js";
import type { Cobranza } from "@horizontal-ph/types";
import type { CobranzaCreateInput, CobranzaUpdateInput, CobranzaQuery } from "./cobranza.schema.js";

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
        new Error("Ya existe una cobranza con ese número de recibo en este conjunto"),
        { statusCode: 409 }
      );
    }
    return repo.create(data);
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async update(id: string, data: CobranzaUpdateInput): Promise<Cobranza> {
    const existing = await repo.findById(id);
    if (!existing) {
      throw Object.assign(new Error("Cobranza no encontrada"), { statusCode: 404 });
    }

    // No se puede modificar una cobranza anulada
    if ((existing as any).estado === "anulada") {
      throw Object.assign(
        new Error("No se puede modificar una cobranza anulada"),
        { statusCode: 400 }
      );
    }

    // No se puede reabrir una cobranza ya pagada (solo anular)
    if ((existing as any).estado === "pagada" && data.estado && data.estado !== "anulada") {
      throw Object.assign(
        new Error("Una cobranza pagada solo puede ser anulada"),
        { statusCode: 400 }
      );
    }

    return (await repo.update(id, data)) as Cobranza;
  }

  // ── Hard delete ───────────────────────────────────────────────────────────

  async remove(id: string): Promise<void> {
    const existing = await repo.findById(id);
    if (!existing) {
      throw Object.assign(new Error("Cobranza no encontrada"), { statusCode: 404 });
    }

    // Solo se pueden eliminar cobranzas anuladas o pendientes
    const estado = (existing as any).estado as string;
    if (!["anulada", "pendiente"].includes(estado)) {
      throw Object.assign(
        new Error("Solo se pueden eliminar cobranzas en estado pendiente o anulada"),
        { statusCode: 400 }
      );
    }

    await repo.remove(id);
  }
}