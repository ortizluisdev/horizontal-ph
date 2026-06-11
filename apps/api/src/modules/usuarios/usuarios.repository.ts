import { pool } from "../../core/database/pg.client.js";
import { AuthRepository } from "../auth/auth.repository.js";
import type { User } from "@horizontal-ph/types";

const authRepo = new AuthRepository();

export class UsuarioRepository {
  async list(): Promise<User[]> {
    const res = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.role_id, r.nombre AS role_name,
              u.unidad_id, u.tipo_usuario, u.activo, u.created_at, u.updated_at
       FROM users u
       LEFT JOIN auth_roles r ON r.id = u.role_id
       ORDER BY u.created_at DESC
       LIMIT 200`,
    );
    return res.rows;
  }

  async findById(id: string): Promise<User | null> {
    const res = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.role_id, r.nombre AS role_name,
              u.unidad_id, u.tipo_usuario, u.activo, u.created_at, u.updated_at
       FROM users u
       LEFT JOIN auth_roles r ON r.id = u.role_id
       WHERE u.id = $1 LIMIT 1`,
      [id],
    );
    return res.rows[0] ?? null;
  }

  async create(data: {
    nombre: string;
    email: string;
    password: string;
    roleName?: string;
    unidadId?: string | null;
    tenantId?: string | null;
    tipoUsuario?: string;
  }): Promise<User> {
    return authRepo.createUser({
      nombre: data.nombre,
      email: data.email,
      password: data.password,
      roleName: data.roleName,
      unidadId: data.unidadId ?? null,
      tenantId: data.tenantId ?? null,
      tipoUsuario: data.tipoUsuario ?? "propietario",
    } as any);
  }

  async update(
    id: string,
    data: { nombre?: string; unidadId?: string | null; tipoUsuario?: string; activo?: boolean },
  ): Promise<User | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.nombre !== undefined)      { sets.push(`nombre = $${idx++}`);        values.push(data.nombre); }
    if (data.unidadId !== undefined)    { sets.push(`unidad_id = $${idx++}`);      values.push(data.unidadId); }
    if (data.tipoUsuario !== undefined) { sets.push(`tipo_usuario = $${idx++}`);   values.push(data.tipoUsuario); }
    if (data.activo !== undefined)      { sets.push(`activo = $${idx++}`);         values.push(data.activo); }

    if (sets.length === 0) return this.findById(id);

    sets.push(`updated_at = now()`);
    values.push(id);

    await pool.query(
      `UPDATE users SET ${sets.join(", ")} WHERE id = $${idx}`,
      values,
    );
    return this.findById(id);
  }

  async remove(id: string): Promise<boolean> {
    const res = await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
    return (res.rowCount ?? 0) > 0;
  }
}