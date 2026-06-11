import { pool } from "../../core/database/pg.client.js";
import type { NewUserInput, User, Role } from "@horizontal-ph/types";
import crypto from "crypto";

function hashPassword(password: string, salt: string) {
  return crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export class AuthRepository {
  async findRoleByName(name: string): Promise<Role | null> {
    const res = await pool.query("SELECT * FROM auth_roles WHERE nombre = $1 LIMIT 1", [name]);
    return res.rows[0] ?? null;
  }

  async createUser(input: NewUserInput) {
    const salt = crypto.randomBytes(16).toString("hex");
    const password_hash = hashPassword(input.password, salt);

    let roleId: string | null = null;
    if (input.roleName) {
      const role = await this.findRoleByName(input.roleName);
      if (role) roleId = role.id;
    }

    try {
      const insert = await pool.query(
        `INSERT INTO users (nombre, email, password_hash, password_salt, role_id, unidad_id, tenant_id, tipo_usuario)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [
          input.nombre,
          input.email,
          password_hash,
          salt,
          roleId,
          input.unidadId ?? null,
          (input as any).tenantId ?? null,
          (input as any).tipoUsuario ?? "administrador",
        ]
      );

      const id = insert.rows[0].id as string;
      return this.findUserById(id) as Promise<User>;
    } catch (err: any) {
      if (err.code === "23505") {
        throw Object.assign(new Error("El email ya está registrado para este tenant"), {
          statusCode: 409,
        });
      }
      throw err;
    }
  }

  async findUserByEmail(email: string): Promise<(User & { password_hash?: string; password_salt?: string }) | null> {
    const res = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.role_id, r.nombre as role_name, u.unidad_id, u.password_hash, u.password_salt, u.created_at, u.updated_at
       FROM users u
       LEFT JOIN auth_roles r ON r.id = u.role_id
       WHERE u.email = $1 LIMIT 1`,
      [email]
    );
    return res.rows[0] ?? null;
  }

  async findUserById(id: string): Promise<User | null> {
    const res = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.role_id, r.nombre as role_name, u.unidad_id, u.created_at, u.updated_at
       FROM users u
       LEFT JOIN auth_roles r ON r.id = u.role_id
       WHERE u.id = $1 LIMIT 1`,
      [id]
    );
    return res.rows[0] ?? null;
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const row = await this.findUserByEmail(email);
    if (!row) return null;
    const salt = (row as any).password_salt as string;
    const hash = (row as any).password_hash as string;
    const candidate = hashPassword(password, salt);
    if (candidate === hash) {
      const { password_hash, password_salt, ...user } = row as any;
      return user as User;
    }
    return null;
  }

  async saveRefreshToken(userId: string, token: string, expiresAt: Date) {
    const token_hash = hashToken(token);
    const res = await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, token_hash, expires_at, revoked, created_at`,
      [userId, token_hash, expiresAt]
    );
    return res.rows[0];
  }

  async findRefreshToken(token: string) {
    const token_hash = hashToken(token);
    const res = await pool.query(
      `SELECT * FROM refresh_tokens WHERE token_hash = $1 LIMIT 1`,
      [token_hash]
    );
    return res.rows[0] ?? null;
  }

  async revokeRefreshToken(token: string) {
    const token_hash = hashToken(token);
    await pool.query(
      `UPDATE refresh_tokens SET revoked = true WHERE token_hash = $1`,
      [token_hash]
    );
  }

  async revokeAllForUser(userId: string) {
    await pool.query(
      `UPDATE refresh_tokens SET revoked = true WHERE user_id = $1`,
      [userId]
    );
  }

  async updatePassword(userId: string, newPassword: string) {
    const salt = crypto.randomBytes(16).toString("hex");
    const password_hash = hashPassword(newPassword, salt);
    await pool.query(
      `UPDATE users SET password_hash = $1, password_salt = $2, updated_at = now() WHERE id = $3`,
      [password_hash, salt, userId]
    );
  }
}