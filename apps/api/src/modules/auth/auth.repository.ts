import crypto from "crypto";
import { pool } from "../../core/database/pg.client.js";
import type { NewUserInput, User, Role } from "@horizontal-ph/types";

// ─── Internal helpers ────────────────────────────────────────────────────────

function hashPassword(password: string, salt: string): string {
  return crypto
    .pbkdf2Sync(password, salt, 100_000, 64, "sha512")
    .toString("hex");
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// ─── Shapes returned by raw queries ─────────────────────────────────────────

interface UserRow extends User {
  password_hash: string;
  password_salt: string;
  activo: boolean;
}

interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked: boolean;
  created_at: Date;
}

// ─── Repository ──────────────────────────────────────────────────────────────

export class AuthRepository {
  // ── Roles ────────────────────────────────────────────────────────────────

  async findRoleByName(name: string): Promise<Role | null> {
    const res = await pool.query<Role>(
      "SELECT * FROM auth_roles WHERE nombre = $1 LIMIT 1",
      [name]
    );
    return res.rows[0] ?? null;
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  async createUser(input: NewUserInput): Promise<User> {
    const salt = crypto.randomBytes(16).toString("hex");
    const password_hash = hashPassword(input.password, salt);

    let roleId: string | null = null;
    if (input.roleName) {
      const role = await this.findRoleByName(input.roleName);
      if (role) roleId = role.id;
    }

    try {
      const insert = await pool.query<{ id: string }>(
        `INSERT INTO users
           (nombre, email, password_hash, password_salt,
            role_id, unidad_id, tenant_id, tipo_usuario)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING id`,
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

      const { id } = insert.rows[0];
      return (await this.findUserById(id)) as User;
    } catch (err: any) {
      if (err.code === "23505") {
        throw Object.assign(
          new Error("El email ya está registrado para este tenant"),
          { statusCode: 409 }
        );
      }
      throw err;
    }
  }

  async findUserByEmail(
    email: string
  ): Promise<UserRow | null> {
    const res = await pool.query<UserRow>(
      `SELECT
         u.id, u.nombre, u.email,
         u.role_id, r.nombre AS role_name,
         u.unidad_id, u.tenant_id,
         u.tipo_usuario, u.activo,
         u.password_hash, u.password_salt,
         u.created_at, u.updated_at
       FROM users u
       LEFT JOIN auth_roles r ON r.id = u.role_id
       WHERE u.email = $1
       LIMIT 1`,
      [email]
    );
    return res.rows[0] ?? null;
  }

  async findUserById(id: string): Promise<User | null> {
    const res = await pool.query<User>(
      `SELECT
         u.id, u.nombre, u.email,
         u.role_id, r.nombre AS role_name,
         u.unidad_id, u.tenant_id,
         u.tipo_usuario, u.activo,
         u.created_at, u.updated_at
       FROM users u
       LEFT JOIN auth_roles r ON r.id = u.role_id
       WHERE u.id = $1
       LIMIT 1`,
      [id]
    );
    return res.rows[0] ?? null;
  }

  /** Returns the user without password fields if credentials match. */
  async verifyPassword(email: string, password: string): Promise<User | null> {
    const row = await this.findUserByEmail(email);
    if (!row) return null;

    if (row.activo === false) {
      throw Object.assign(new Error("La cuenta está desactivada"), {
        statusCode: 403,
      });
    }

    const candidate = hashPassword(password, row.password_salt);
    if (candidate !== row.password_hash) return null;

    const { password_hash, password_salt, ...safeUser } = row;
    return safeUser as User;
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const salt = crypto.randomBytes(16).toString("hex");
    const password_hash = hashPassword(newPassword, salt);
    await pool.query(
      `UPDATE users
       SET password_hash = $1, password_salt = $2, updated_at = now()
       WHERE id = $3`,
      [password_hash, salt, userId]
    );
  }

  // ── Refresh tokens ────────────────────────────────────────────────────────

  async saveRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<RefreshTokenRow> {
    const token_hash = hashToken(token);
    const res = await pool.query<RefreshTokenRow>(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, token_hash, expires_at, revoked, created_at`,
      [userId, token_hash, expiresAt]
    );
    return res.rows[0];
  }

  async findRefreshToken(token: string): Promise<RefreshTokenRow | null> {
    const token_hash = hashToken(token);
    const res = await pool.query<RefreshTokenRow>(
      `SELECT * FROM refresh_tokens WHERE token_hash = $1 LIMIT 1`,
      [token_hash]
    );
    return res.rows[0] ?? null;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const token_hash = hashToken(token);
    await pool.query(
      `UPDATE refresh_tokens SET revoked = true WHERE token_hash = $1`,
      [token_hash]
    );
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await pool.query(
      `UPDATE refresh_tokens SET revoked = true WHERE user_id = $1`,
      [userId]
    );
  }

  /** Removes tokens that are already expired or older than `days` days. */
  async pruneExpiredTokens(days = 30): Promise<void> {
    await pool.query(
      `DELETE FROM refresh_tokens
       WHERE expires_at < now() OR created_at < now() - ($1 || ' days')::interval`,
      [days]
    );
  }
}