import type { FastifyInstance } from "fastify";
import {
  registerHandler,
  loginHandler,
  meHandler,
  refreshHandler,
  logoutHandler,
  changePasswordHandler,
} from "./auth.controller.js";
import authMiddleware from "../../core/auth/auth.middleware.js";

// ─── Shared inline schemas ────────────────────────────────────────────────────

const tags = ["Auth"];

const userShape = {
  type: "object",
  properties: {
    id:         { type: "string", format: "uuid" },
    nombre:     { type: "string" },
    email:      { type: "string", format: "email" },
    role_id:    { type: "string" },
    role_name:  { type: "string" },
    unidad_id:  { type: "string" },
    tenant_id:  { type: "string" },
    tipo_usuario: { type: "string" },
    activo:     { type: "boolean" },
    created_at: { type: "string", format: "date-time" },
    updated_at: { type: "string", format: "date-time" },
  },
} as const;

const refreshShape = {
  type: "object",
  properties: {
    token:     { type: "string" },
    expiresAt: { type: "string", format: "date-time" },
  },
} as const;

const errorShape = {
  type: "object",
  properties: {
    message: { type: "string" },
  },
} as const;

const validationErrorShape = {
  type: "object",
  properties: {
    message: { type: "string" },
    errors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          field:   { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
} as const;

// ─── Route options ────────────────────────────────────────────────────────────

const registerOpts = {
  schema: {
    tags,
    summary: "Registrar nuevo usuario",
    body: {
      type: "object",
      required: ["nombre", "email", "password", "tenantId"],
      properties: {
        nombre:       { type: "string", minLength: 2 },
        email:        { type: "string", format: "email" },
        password:     { type: "string", minLength: 8 },
        tenantId:     { type: "string", format: "uuid" },
        roleName:     { type: "string" },
        unidadId:     { type: "string", format: "uuid" },
        tipoUsuario:  {
          type: "string",
          enum: ["propietario","inquilino","administrador","vigilante","celadora","aseadora","otro"],
        },
      },
    },
    response: {
      201: userShape,
      400: errorShape,
      409: errorShape,
      422: validationErrorShape,
    },
  },
};

const loginOpts = {
  schema: {
    tags,
    summary: "Iniciar sesión",
    body: {
      type: "object",
      required: ["email", "password"],
      properties: {
        email:    { type: "string", format: "email" },
        password: { type: "string" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          token:   { type: "string" },
          refresh: refreshShape,
          user:    userShape,
        },
      },
      401: errorShape,
      403: errorShape,
    },
  },
};

const refreshOpts = {
  schema: {
    tags,
    summary: "Rotar refresh token",
    body: {
      type: "object",
      required: ["refreshToken"],
      properties: {
        refreshToken: { type: "string" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          token:   { type: "string" },
          refresh: refreshShape,
        },
      },
      401: errorShape,
    },
  },
};

const logoutOpts = {
  schema: {
    tags,
    summary: "Cerrar sesión",
    security: [{ bearerAuth: [] }],
    body: {
      type: "object",
      properties: {
        refreshToken: { type: "string" },
      },
    },
    response: {
      200: { type: "object", properties: { ok: { type: "boolean" } } },
    },
  },
};

const meOpts = {
  schema: {
    tags,
    summary: "Perfil del usuario autenticado",
    security: [{ bearerAuth: [] }],
    response: {
      200: userShape,
      401: errorShape,
    },
  },
};

const changePasswordOpts = {
  schema: {
    tags,
    summary: "Cambiar contraseña",
    security: [{ bearerAuth: [] }],
    body: {
      type: "object",
      required: ["currentPassword", "newPassword"],
      properties: {
        currentPassword: { type: "string" },
        newPassword:     { type: "string", minLength: 8 },
      },
    },
    response: {
      200: { type: "object", properties: { ok: { type: "boolean" } } },
      400: errorShape,
      422: validationErrorShape,
    },
  },
};

// ─── Plugin ───────────────────────────────────────────────────────────────────

export default async function authRoutes(app: FastifyInstance) {
  // ── Public ─────────────────────────────────────────────────────────────────
  app.post("/auth/register", registerOpts, registerHandler);
  app.post("/auth/login",    loginOpts,    loginHandler);
  app.post("/auth/refresh",  refreshOpts,  refreshHandler);

  // ── Protected ──────────────────────────────────────────────────────────────
  app.get(   "/auth/me",       { ...meOpts,             preHandler: authMiddleware }, meHandler);
  app.post(  "/auth/logout",   { ...logoutOpts,         preHandler: authMiddleware }, logoutHandler);
  app.patch( "/auth/password", { ...changePasswordOpts, preHandler: authMiddleware }, changePasswordHandler);
}