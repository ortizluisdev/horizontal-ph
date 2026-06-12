import crypto from "crypto";
import { AuthRepository } from "./auth.repository.js";
import type { NewUserInput, User } from "@horizontal-ph/types";

// ─── Config ──────────────────────────────────────────────────────────────────

const REFRESH_TOKEN_EXPIRES_DAYS = 30;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RefreshTokenPayload {
  token: string;
  expiresAt: Date;
}

export interface AuthTokens {
  refresh: RefreshTokenPayload;
  user: User;
}

// ─── Service ─────────────────────────────────────────────────────────────────

const repo = new AuthRepository();

export class AuthService {
  // ── Registration ─────────────────────────────────────────────────────────

  async register(input: NewUserInput): Promise<User> {
    return repo.createUser(input);
  }

  // ── Login ─────────────────────────────────────────────────────────────────

  /**
   * Verifies credentials and returns the user if valid.
   * Throws 403 if the account is inactive.
   * Returns null if credentials are wrong.
   */
  async login(email: string, password: string): Promise<User | null> {
    return repo.verifyPassword(email, password);
  }

  // ── Refresh tokens ────────────────────────────────────────────────────────

  async createRefreshToken(userId: string): Promise<RefreshTokenPayload> {
    const token = crypto.randomBytes(48).toString("hex");
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1_000
    );
    await repo.saveRefreshToken(userId, token, expiresAt);
    return { token, expiresAt };
  }

  /**
   * Rotates a refresh token: revokes the old one and issues a new pair.
   * Returns null if the token is invalid, revoked, or expired.
   */
  async refresh(oldToken: string): Promise<AuthTokens | null> {
    const found = await repo.findRefreshToken(oldToken);

    if (!found || found.revoked) return null;
    if (new Date(found.expires_at) < new Date()) return null;

    await repo.revokeRefreshToken(oldToken);

    const [user, refresh] = await Promise.all([
      this.findById(found.user_id),
      this.createRefreshToken(found.user_id),
    ]);

    if (!user) return null;
    return { user, refresh };
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  /** Revokes the given refresh token and all tokens for the user (full logout). */
  async logout(refreshToken?: string, userId?: string): Promise<void> {
    const tasks: Promise<void>[] = [];
    if (refreshToken) tasks.push(repo.revokeRefreshToken(refreshToken));
    if (userId) tasks.push(repo.revokeAllForUser(userId));
    await Promise.all(tasks);
  }

  // ── Password ──────────────────────────────────────────────────────────────

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await repo.findUserById(userId);
    if (!user) throw Object.assign(new Error("Usuario no encontrado"), { statusCode: 404 });

    const verified = await repo.verifyPassword((user as any).email, currentPassword);
    if (!verified) {
      throw Object.assign(new Error("Contraseña actual incorrecta"), { statusCode: 400 });
    }

    await repo.updatePassword(userId, newPassword);
    // Invalidate all sessions after password change (security best practice)
    await repo.revokeAllForUser(userId);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  async findById(id: string): Promise<User | null> {
    return repo.findUserById(id);
  }
}