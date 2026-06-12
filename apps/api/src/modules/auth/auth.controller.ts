import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AuthService } from "./auth.service.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  changePasswordSchema,
} from "./auth.schema.js";

// ─── Singleton service ────────────────────────────────────────────────────────

const service = new AuthService();

// ─── Internal helpers ─────────────────────────────────────────────────────────

function handleZodError(reply: FastifyReply, err: ZodError) {
  return reply.code(422).send({
    message: "Datos de entrada inválidos",
    errors: err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    })),
  });
}

function handleServiceError(reply: FastifyReply, err: unknown) {
  const e = err as any;
  const statusCode = e?.statusCode ?? 400;
  return reply.code(statusCode).send({ message: e?.message ?? "Error interno" });
}

function getRoleForToken(user: any): string | undefined {
  return user.role_name ?? user.role_id ?? undefined;
}

// ─── Handlers ────────────────────────────────────────────────────────────────
// NOTE: handlers use plain FastifyRequest (no Body generic) because Fastify
// sets req.body to `unknown` when a JSON Schema is attached to the route.
// Validation is handled by Zod's safeParse inside each handler.

export async function registerHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) return handleZodError(reply, result.error);

  try {
    const user = await service.register(result.data as any);
    return reply.code(201).send(user);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function loginHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) return handleZodError(reply, result.error);

  try {
    const user = await service.login(result.data.email, result.data.password);
    if (!user) return reply.code(401).send({ message: "Credenciales inválidas" });

    const token = await reply.jwtSign({
      sub: user.id,
      email: user.email,
      role: getRoleForToken(user),
    });

    const refresh = await service.createRefreshToken(user.id);
    return reply.send({ token, refresh, user });
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function refreshHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const result = refreshSchema.safeParse(req.body);
  if (!result.success) return handleZodError(reply, result.error);

  try {
    const rotated = await service.refresh(result.data.refreshToken);
    if (!rotated) {
      return reply.code(401).send({ message: "Refresh token inválido o expirado" });
    }

    const { user, refresh } = rotated;
    const token = await reply.jwtSign({
      sub: user.id,
      email: user.email,
      role: getRoleForToken(user),
    });

    return reply.send({ token, refresh });
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function logoutHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const result = logoutSchema.safeParse(req.body);
  if (!result.success) return handleZodError(reply, result.error);

  const userId = (req as any).user?.sub ?? (req as any).user?.id;

  try {
    await service.logout(result.data.refreshToken, userId);
    return reply.send({ ok: true });
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function changePasswordHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const userId = (req as any).user?.sub ?? (req as any).user?.id;
  if (!userId) return reply.code(401).send({ message: "No autenticado" });

  const result = changePasswordSchema.safeParse(req.body);
  if (!result.success) return handleZodError(reply, result.error);

  try {
    await service.changePassword(
      userId,
      result.data.currentPassword,
      result.data.newPassword
    );
    return reply.send({ ok: true });
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function meHandler(req: FastifyRequest, reply: FastifyReply) {
  const user = (req as any).user;
  if (!user) return reply.code(401).send({ message: "No autenticado" });
  return reply.send(user);
}