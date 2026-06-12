import { NotificacionRepository, type PaginatedNotificaciones } from "./notificacion.repository.js";
import type { Notificacion } from "@horizontal-ph/types";
import type {
  NotificacionCreateInput,
  NotificacionUpdateInput,
  NotificacionQuery,
} from "./notificacion.schema.js";

// ─── Singleton ────────────────────────────────────────────────────────────────

const repo = new NotificacionRepository();

// ─── Service ──────────────────────────────────────────────────────────────────

export class NotificacionService {

  async list(query: NotificacionQuery, tenantId: string): Promise<PaginatedNotificaciones> {
    return repo.list(query, tenantId);
  }

  async findById(id: string, tenantId: string): Promise<Notificacion | null> {
    return repo.findById(id, tenantId);
  }

  async create(data: NotificacionCreateInput, tenantId: string): Promise<Notificacion> {
    // Una notificación urgente sin canal definido es un error
    if (data.urgente && !data.canal_envio) {
      throw Object.assign(
        new Error("Una notificación urgente debe tener canal de envío definido"),
        { statusCode: 400 }
      );
    }

    // Si no tiene fecha programada, se envía inmediatamente (estado: pendiente)
    return repo.create(data, tenantId);
  }

  async update(id: string, data: NotificacionUpdateInput, tenantId: string): Promise<Notificacion> {
    const existing = await repo.findById(id, tenantId);
    if (!existing) {
      throw Object.assign(new Error("Notificación no encontrada"), { statusCode: 404 });
    }

    // No se puede modificar una notificación ya leída o fallida definitivamente
    const estado = (existing as any).estado as string;
    if (estado === "leida") {
      throw Object.assign(
        new Error("No se puede modificar una notificación ya leída"),
        { statusCode: 400 }
      );
    }

    // No se puede confirmar sin que requiera confirmación
    if (data.confirmada && !(existing as any).requiere_confirmacion) {
      throw Object.assign(
        new Error("Esta notificación no requiere confirmación"),
        { statusCode: 400 }
      );
    }

    await repo.update(id, data);
    return (await repo.findById(id, tenantId)) as Notificacion;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const existing = await repo.findById(id, tenantId);
    if (!existing) {
      throw Object.assign(new Error("Notificación no encontrada"), { statusCode: 404 });
    }

    // Solo se pueden eliminar notificaciones pendientes o fallidas
    const estado = (existing as any).estado as string;
    if (!["pendiente", "fallida"].includes(estado)) {
      throw Object.assign(
        new Error("Solo se pueden eliminar notificaciones en estado pendiente o fallida"),
        { statusCode: 400 }
      );
    }

    await repo.remove(id);
  }
}