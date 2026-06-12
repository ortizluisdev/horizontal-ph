import { ContabilidadRepository, type PaginatedMovimientos } from "./contabilidad.repository.js";
import type { MovimientoContable } from "@horizontal-ph/types";
import type {
  MovimientoCreateInput,
  MovimientoUpdateInput,
  MovimientoAnularInput,
  MovimientoQuery,
} from "./contabilidad.schema.js";

// ─── Singleton ────────────────────────────────────────────────────────────────

const repo = new ContabilidadRepository();

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BalancePeriodo {
  conjuntoId:     string;
  fechaDesde:     string;
  fechaHasta:     string;
  total_debitos:  number;
  total_creditos: number;
  saldo:          number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class ContabilidadService {
  // ── List ──────────────────────────────────────────────────────────────────

  async list(query: MovimientoQuery): Promise<PaginatedMovimientos> {
    return repo.list(query);
  }

  // ── Find one ──────────────────────────────────────────────────────────────

  async findById(id: string): Promise<MovimientoContable | null> {
    return repo.findById(id);
  }

  // ── Create ────────────────────────────────────────────────────────────────

  async create(data: MovimientoCreateInput): Promise<MovimientoContable> {
    // Unicidad del número de asiento por conjunto
    const duplicate = await repo.existsByNumeroAsiento(
      data.conjuntoId,
      data.numero_asiento
    );
    if (duplicate) {
      throw Object.assign(
        new Error("Ya existe un movimiento con ese número de asiento en este conjunto"),
        { statusCode: 409 }
      );
    }

    // La fecha del movimiento no puede ser futura
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);
    if (new Date(data.fecha_movimiento) > hoy) {
      throw Object.assign(
        new Error("La fecha del movimiento no puede ser futura"),
        { statusCode: 400 }
      );
    }

    return repo.create(data);
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async update(id: string, data: MovimientoUpdateInput): Promise<MovimientoContable> {
    const existing = await repo.findById(id);
    if (!existing) {
      throw Object.assign(new Error("Movimiento no encontrado"), { statusCode: 404 });
    }

    if ((existing as any).estado === "anulado") {
      throw Object.assign(
        new Error("No se puede modificar un movimiento anulado"),
        { statusCode: 400 }
      );
    }

    return (await repo.update(id, data)) as MovimientoContable;
  }

  // ── Anular ────────────────────────────────────────────────────────────────

  /**
   * Los movimientos contables NUNCA se eliminan — solo se anulan.
   * La anulación es irreversible y requiere motivo explícito.
   */
  async anular(id: string, payload: MovimientoAnularInput): Promise<MovimientoContable> {
    const existing = await repo.findById(id);
    if (!existing) {
      throw Object.assign(new Error("Movimiento no encontrado"), { statusCode: 404 });
    }

    if ((existing as any).estado === "anulado") {
      throw Object.assign(
        new Error("El movimiento ya se encuentra anulado"),
        { statusCode: 400 }
      );
    }

    return (await repo.anular(id, payload.motivo_anulacion)) as MovimientoContable;
  }

  // ── Balance por período ───────────────────────────────────────────────────

  async getBalance(
    conjuntoId: string,
    fechaDesde: string,
    fechaHasta: string
  ): Promise<BalancePeriodo> {
    if (new Date(fechaDesde) > new Date(fechaHasta)) {
      throw Object.assign(
        new Error("fechaDesde no puede ser posterior a fechaHasta"),
        { statusCode: 400 }
      );
    }

    const balance = await repo.getBalance(conjuntoId, fechaDesde, fechaHasta);

    return {
      conjuntoId,
      fechaDesde,
      fechaHasta,
      ...balance,
    };
  }
}