import { pool } from "../../core/database/pg.client.js";
import { AuthRepository } from "../auth/auth.repository.js";
import type { User } from "@horizontal-ph/types";
import type { UsuarioCreateInput, UsuarioUpdateInput, UsuarioQuery } from "./usuarios.schema.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginatedUsuarios {
  data:  User[];
  total: number;
  page:  number;
  limit: number;
  pages: number;
}

// ─── Singleton del repo de auth ───────────────────────────────────────────────

const authRepo = new AuthRepository();

// ─── Repository ───────────────────────────────────────────────────────────────

export class UsuarioRepository {

  // ── Listar con filtros y paginación ──────────────────────────────────────

  async list(query: UsuarioQuery, tenantId: string): Promise<PaginatedUsuarios> {
    const { page, limit, tipoUsuario, conjuntoId, unidadId, activo, bloqueado, search } = query;
    const offset = (page - 1) * limit;

    const conditions: string[] = ["u.tenant_id = $1", "u.deleted_at IS NULL"];
    const values: unknown[]    = [tenantId];
    let idx = 2;

    if (tipoUsuario) { conditions.push(`u.tipo_usuario = $${idx++}`);  values.push(tipoUsuario); }
    if (conjuntoId)  { conditions.push(`u.conjunto_id = $${idx++}`);   values.push(conjuntoId); }
    if (unidadId)    { conditions.push(`u.unidad_id = $${idx++}`);     values.push(unidadId); }
    if (activo !== undefined)   { conditions.push(`u.activo = $${idx++}`);    values.push(activo); }
    if (bloqueado !== undefined){ conditions.push(`u.bloqueado = $${idx++}`); values.push(bloqueado); }
    if (search) {
      conditions.push(`(u.nombre ILIKE $${idx} OR u.email ILIKE $${idx++})`);
      values.push(`%${search}%`);
    }

    const where = `WHERE ${conditions.join(" AND ")}`;

    const [dataRes, countRes] = await Promise.all([
      pool.query<User>(
        `SELECT u.id, u.tenant_id, u.nombre, u.email, u.role_id,
                r.nombre AS role_name, u.unidad_id, u.conjunto_id,
                u.tipo_usuario, u.telefono, u.documento_identificacion,
                u.numero_documento, u.url_foto, u.activo, u.verificado,
                u.bloqueado, u.fecha_bloqueo, u.razon_bloqueo,
                u.ultimo_login, u.intento_fallidos_login,
                u.created_at, u.updated_at
         FROM users u
         LEFT JOIN auth_roles r ON r.id = u.role_id
         ${where}
         ORDER BY u.created_at DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
        [...values, limit, offset]
      ),
      pool.query<{ total: string }>(
        `SELECT COUNT(*) AS total FROM users u ${where}`,
        values
      ),
    ]);

    const total = parseInt(countRes.rows[0].total, 10);
    return { data: dataRes.rows, total, page, limit, pages: Math.ceil(total / limit) };
  }

  // ── Buscar por ID ─────────────────────────────────────────────────────────

  async findById(id: string, tenantId: string): Promise<User | null> {
    const res = await pool.query<User>(
      `SELECT u.id, u.tenant_id, u.nombre, u.email, u.role_id,
              r.nombre AS role_name, u.unidad_id, u.conjunto_id,
              u.tipo_usuario, u.telefono, u.documento_identificacion,
              u.numero_documento, u.url_foto, u.activo, u.verificado,
              u.bloqueado, u.fecha_bloqueo, u.razon_bloqueo,
              u.ultimo_login, u.intento_fallidos_login,
              u.created_at, u.updated_at
       FROM users u
       LEFT JOIN auth_roles r ON r.id = u.role_id
       WHERE u.id = $1 AND u.tenant_id = $2 AND u.deleted_at IS NULL
       LIMIT 1`,
      [id, tenantId]
    );
    return res.rows[0] ?? null;
  }

  // ── Crear ─────────────────────────────────────────────────────────────────

  async create(data: UsuarioCreateInput, tenantId: string): Promise<User> {
    return authRepo.createUser({
      nombre:                 data.nombre,
      email:                  data.email,
      password:               data.password,
      roleName:               data.role,
      unidadId:               data.unidadId   ?? null,
      tenantId,
      conjuntoId:             data.conjuntoId ?? null,
      tipoUsuario:            data.tipoUsuario ?? "propietario",
      telefono:               data.telefono   ?? null,
      documentoIdentificacion:data.documentoIdentificacion ?? null,
      numeroDocumento:        data.numeroDocumento ?? null,
      urlFoto:                data.urlFoto    ?? null,
    } as any);
  }

  // ── Actualizar ────────────────────────────────────────────────────────────

  async update(id: string, data: UsuarioUpdateInput, tenantId: string, updatedBy?: string): Promise<User | null> {
    const sets: string[]    = [];
    const values: unknown[] = [];
    let idx = 1;

    const fieldMap: Record<string, string> = {
      nombre:                  "nombre",
      unidadId:                "unidad_id",
      conjuntoId:              "conjunto_id",
      tipoUsuario:             "tipo_usuario",
      telefono:                "telefono",
      documentoIdentificacion: "documento_identificacion",
      numeroDocumento:         "numero_documento",
      urlFoto:                 "url_foto",
      activo:                  "activo",
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      const val = (data as any)[key];
      if (val !== undefined) {
        sets.push(`${col} = $${idx++}`);
        values.push(val);
      }
    }

    if (sets.length === 0) return this.findById(id, tenantId);

    sets.push(`updated_at = now()`);
    values.push(id, tenantId);

    await pool.query(
      `UPDATE users SET ${sets.join(", ")} WHERE id = $${idx++} AND tenant_id = $${idx++}`,
      values
    );

    // Registrar auditoría
    await this._audit(id, "actualizar_perfil", "Perfil actualizado", updatedBy);

    return this.findById(id, tenantId);
  }

  // ── Bloquear / Desbloquear ────────────────────────────────────────────────

  async setBloqueado(
    id: string,
    tenantId: string,
    bloqueado: boolean,
    razon?: string,
    adminId?: string
  ): Promise<User | null> {
    await pool.query(
      `UPDATE users
       SET bloqueado = $1,
           fecha_bloqueo = $2,
           razon_bloqueo = $3,
           updated_at = now()
       WHERE id = $4 AND tenant_id = $5`,
      [
        bloqueado,
        bloqueado ? new Date() : null,
        bloqueado ? (razon ?? null) : null,
        id,
        tenantId,
      ]
    );

    await this._audit(
      id,
      bloqueado ? "bloqueo" : "desbloqueo",
      bloqueado ? `Usuario bloqueado: ${razon ?? "sin razón"}` : "Usuario desbloqueado",
      adminId
    );

    return this.findById(id, tenantId);
  }

  // ── Soft delete ───────────────────────────────────────────────────────────

  async remove(id: string, tenantId: string, deletedBy?: string): Promise<boolean> {
    const res = await pool.query(
      `UPDATE users
       SET deleted_at = now(), activo = false, updated_at = now()
       WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
      [id, tenantId]
    );

    if ((res.rowCount ?? 0) > 0) {
      await this._audit(id, "eliminar_usuario", "Usuario eliminado (soft delete)", deletedBy);
      return true;
    }
    return false;
  }

  // ── Historial de auditoría ────────────────────────────────────────────────

  async getAuditLog(userId: string, tenantId: string) {
    // Validar que el usuario pertenece al tenant
    const user = await this.findById(userId, tenantId);
    if (!user) return null;

    const res = await pool.query(
      `SELECT id, accion, descripcion, ip_address, cambios_anteriores,
              cambios_nuevos, fecha_accion, realizado_por
       FROM user_audit_log
       WHERE user_id = $1
       ORDER BY fecha_accion DESC
       LIMIT 50`,
      [userId]
    );
    return res.rows;
  }

  // ── Sesiones activas ──────────────────────────────────────────────────────

  async getSessions(userId: string, tenantId: string) {
    const user = await this.findById(userId, tenantId);
    if (!user) return null;

    const res = await pool.query(
      `SELECT id, ip_address, device_name, os_name, browser_name,
              es_mobile, fecha_inicio, fecha_expiracion, activa
       FROM user_sessions
       WHERE user_id = $1 AND activa = true
         AND (fecha_expiracion IS NULL OR fecha_expiracion > now())
       ORDER BY fecha_inicio DESC`,
      [userId]
    );
    return res.rows;
  }

  // ── Audit helper ─────────────────────────────────────────────────────────

  private async _audit(userId: string, accion: string, descripcion: string, realizadoPor?: string) {
    await pool.query(
      `INSERT INTO user_audit_log (user_id, accion, descripcion, realizado_por)
       VALUES ($1, $2, $3, $4)`,
      [userId, accion, descripcion, realizadoPor ?? null]
    ).catch(() => { /* no bloquear si falla la auditoría */ });
  }
}