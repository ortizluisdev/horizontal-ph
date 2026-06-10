import { AuthRepository } from "./auth.repository";
import type { NewUserInput, User } from "@horizontal-ph/types";
import crypto from "crypto";

const REFRESH_TOKEN_EXPIRES_DAYS = 30;

const repo = new AuthRepository();

export class AuthService {
  async register(input: NewUserInput): Promise<User> {
    // podría añadir validaciones adicionales (email único ya lanzará error en BD)
    return repo.createUser(input);
  }

  async login(email: string, password: string): Promise<User | null> {
    return repo.verifyPassword(email, password);
  }

  async createRefreshToken(userId: string) {
    const token = crypto.randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
    await repo.saveRefreshToken(userId, token, expiresAt);
    return { token, expiresAt };
  }

  async refresh(oldToken: string) {
    const found = await repo.findRefreshToken(oldToken);
    if (!found || found.revoked) return null;
    if (new Date(found.expires_at) < new Date()) return null;

    // rotate: revoke old and issue new
    await repo.revokeRefreshToken(oldToken);
    const newToken = await this.createRefreshToken(found.user_id);
    const user = await this.findById(found.user_id);
    return { user, refresh: newToken };
  }

  async logout(refreshToken?: string, userId?: string) {
    if (refreshToken) await repo.revokeRefreshToken(refreshToken);
    if (userId) await repo.revokeAllForUser(userId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // verify current password
    const user = await repo.findUserById(userId);
    if (!user) throw new Error("Usuario no encontrado");
    const verified = await repo.verifyPassword((user as any).email, currentPassword);
    if (!verified) throw new Error("Contraseña actual incorrecta");
    await repo.updatePassword(userId, newPassword);
    // revoke all refresh tokens after password change
    await repo.revokeAllForUser(userId);
  }

  async findById(id: string): Promise<User | null> {
    return repo.findUserById(id);
  }
}
