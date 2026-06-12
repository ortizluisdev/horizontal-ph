import { UsuarioRepository, type PaginatedUsuarios } from "./usuarios.repository.js";
import type { User } from "@horizontal-ph/types";
import type {
  UsuarioCreateInput,
  UsuarioUpdateInput,
  UsuarioQuery,
  UsuarioBloqueoInput,
} from "./usuarios.schema.js";

// ─── Singleton ────────────────────────────────────────────────────────────────

const repo = new UsuarioRepository();

// ─── Service ──────────────────────────────────────────────────────────────────

export class UsuarioService {

  async list(query: UsuarioQuery, tenantId: string): Promise<PaginatedUsuarios> {
    return repo.list(query, tenantId);
  }

  async findById(id: string, tenantId: string): Promise<User | null> {
    return repo.findById(id, tenantId);
  }

  async getAuditLog(userId: string, tenantId: string) {
    const result = await repo.getAuditLog(userId, tenantId);
    if (result === null) {
      throw Object.assign(new Error("Usuario no encontrado"), { statusCode: 404 });
    }
    return result;
  }

  async getSessions(userId: string, tenantId: string) {
    const result = await repo.getSessions(userId, tenantId);
    if (result === null) {
      throw Object.assign(new Error("Usuario no encontrado"), { statusCode: 404 });
    }
    return result;
  }

  async create(data: UsuarioCreateInput, tenantId: string): Promise<User> {
    try {
      return await repo.create(data, tenantId);
    } catch (err: any) {
      if (err.statusCode === 409) throw err;
      throw Object.assign(
        new Error("Error creando usuario: " + err.message),
        { statusCode: 400 }
      );
    }
  }

  async update(id: string, data: UsuarioUpdateInput, tenantId: string, updatedBy?: string): Promise<User> {
    const existing = await repo.findById(id, tenantId);
    if (!existing) {
      throw Object.assign(new Error("Usuario no encontrado"), { statusCode: 404 });
    }

    if ((existing as any).bloqueado) {
      throw Object.assign(
        new Error("No se puede modificar un usuario bloqueado. Desbloquéalo primero"),
        { statusCode: 400 }
      );
    }

    return (await repo.update(id, data, tenantId, updatedBy)) as User;
  }

  async setBloqueado(
    id: string,
    tenantId: string,
    data: UsuarioBloqueoInput,
    adminId?: string
  ): Promise<User> {
    const existing = await repo.findById(id, tenantId);
    if (!existing) {
      throw Object.assign(new Error("Usuario no encontrado"), { statusCode: 404 });
    }

    // No bloquear al mismo admin que ejecuta la acción
    if (adminId && id === adminId) {
      throw Object.assign(
        new Error("No puedes bloquearte a ti mismo"),
        { statusCode: 400 }
      );
    }

    return (await repo.setBloqueado(id, tenantId, data.bloqueado, data.razon_bloqueo, adminId)) as User;
  }

  async remove(id: string, tenantId: string, deletedBy?: string): Promise<void> {
    const existing = await repo.findById(id, tenantId);
    if (!existing) {
      throw Object.assign(new Error("Usuario no encontrado"), { statusCode: 404 });
    }

    // No eliminar al mismo usuario que ejecuta la acción
    if (deletedBy && id === deletedBy) {
      throw Object.assign(
        new Error("No puedes eliminarte a ti mismo"),
        { statusCode: 400 }
      );
    }

    const deleted = await repo.remove(id, tenantId, deletedBy);
    if (!deleted) {
      throw Object.assign(new Error("No se pudo eliminar el usuario"), { statusCode: 500 });
    }
  }
}