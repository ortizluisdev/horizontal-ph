import type { FastifyInstance } from "fastify";
import authMiddleware from "../../core/auth/auth.middleware.js";
import permitRoles from "../../core/auth/permissions.guard.js";
import {
  getUsuarios,
  getUsuarioById,
  getUsuarioAuditLog,
  getUsuarioSessions,
  createUsuario,
  updateUsuario,
  setBloqueadoUsuario,
  deleteUsuario,
} from "./usuarios.controller.js";

// ─── Shapes ───────────────────────────────────────────────────────────────────

const tags = ["Usuarios"];

const usuarioShape = {
  type: "object",
  properties: {
    id:                      { type: "string", format: "uuid" },
    tenant_id:               { type: "string", format: "uuid" },
    nombre:                  { type: "string" },
    email:                   { type: "string" },
    role_id:                 { type: "string", format: "uuid" },
    role_name:               { type: "string" },
    unidad_id:               { type: "string", format: "uuid" },
    conjunto_id:             { type: "string", format: "uuid" },
    tipo_usuario:            { type: "string", enum: ["propietario","inquilino","administrador","vigilante","celadora","aseadora","contador","gerente","otro"] },
    telefono:                { type: "string" },
    documento_identificacion:{ type: "string" },
    numero_documento:        { type: "string" },
    url_foto:                { type: "string" },
    activo:                  { type: "boolean" },
    verificado:              { type: "boolean" },
    bloqueado:               { type: "boolean" },
    fecha_bloqueo:           { type: "string", format: "date-time" },
    razon_bloqueo:           { type: "string" },
    ultimo_login:            { type: "string", format: "date-time" },
    intento_fallidos_login:  { type: "integer" },
    created_at:              { type: "string", format: "date-time" },
    updated_at:              { type: "string", format: "date-time" },
  },
} as const;

const auditShape = {
  type: "array",
  items: {
    type: "object",
    properties: {
      id:                 { type: "string", format: "uuid" },
      accion:             { type: "string" },
      descripcion:        { type: "string" },
      ip_address:         { type: "string" },
      cambios_anteriores: { type: "object" },
      cambios_nuevos:     { type: "object" },
      fecha_accion:       { type: "string", format: "date-time" },
      realizado_por:      { type: "string", format: "uuid" },
    },
  },
} as const;

const sessionShape = {
  type: "array",
  items: {
    type: "object",
    properties: {
      id:               { type: "string", format: "uuid" },
      ip_address:       { type: "string" },
      device_name:      { type: "string" },
      os_name:          { type: "string" },
      browser_name:     { type: "string" },
      es_mobile:        { type: "boolean" },
      fecha_inicio:     { type: "string", format: "date-time" },
      fecha_expiracion: { type: "string", format: "date-time" },
      activa:           { type: "boolean" },
    },
  },
} as const;

const errorShape           = { type: "object", properties: { message: { type: "string" } } } as const;
const validationErrorShape = {
  type: "object",
  properties: {
    message: { type: "string" },
    errors: { type: "array", items: { type: "object", properties: { field: { type: "string" }, message: { type: "string" } } } },
  },
} as const;
const paginatedShape = {
  type: "object",
  properties: {
    data:  { type: "array", items: usuarioShape },
    total: { type: "number" },
    page:  { type: "number" },
    limit: { type: "number" },
    pages: { type: "number" },
  },
} as const;
const idParam = { type: "object", properties: { id: { type: "string", format: "uuid" } } } as const;

// ─── Route options ────────────────────────────────────────────────────────────

const listOpts = {
  schema: {
    tags, summary: "Listar usuarios del tenant", security: [{ bearerAuth: [] }],
    querystring: {
      type: "object",
      properties: {
        page:        { type: "integer", minimum: 1, default: 1 },
        limit:       { type: "integer", minimum: 1, maximum: 100, default: 20 },
        tipoUsuario: { type: "string", enum: ["propietario","inquilino","administrador","vigilante","celadora","aseadora","contador","gerente","otro"] },
        conjuntoId:  { type: "string", format: "uuid" },
        unidadId:    { type: "string", format: "uuid" },
        activo:      { type: "boolean" },
        bloqueado:   { type: "boolean" },
        search:      { type: "string" },
      },
    },
    response: { 200: paginatedShape },
  },
};

const getByIdOpts = {
  schema: {
    tags, summary: "Obtener usuario por ID", security: [{ bearerAuth: [] }],
    params: idParam,
    response: { 200: usuarioShape, 404: errorShape },
  },
};

const auditOpts = {
  schema: {
    tags, summary: "Historial de auditoría de un usuario", security: [{ bearerAuth: [] }],
    params: idParam,
    response: { 200: auditShape, 404: errorShape },
  },
};

const sessionsOpts = {
  schema: {
    tags, summary: "Sesiones activas de un usuario", security: [{ bearerAuth: [] }],
    params: idParam,
    response: { 200: sessionShape, 404: errorShape },
  },
};

const createOpts = {
  schema: {
    tags, summary: "Crear usuario", security: [{ bearerAuth: [] }],
    body: {
      type: "object",
      required: ["nombre", "email", "password"],
      properties: {
        nombre:                  { type: "string", minLength: 2 },
        email:                   { type: "string", format: "email" },
        password:                { type: "string", minLength: 8 },
        conjuntoId:              { type: "string", format: "uuid" },
        role:                    { type: "string", enum: ["propietario","inquilino","administrador","vigilante","celadora","aseadora","contador","gerente","otro"] },
        tipoUsuario:             { type: "string", enum: ["propietario","inquilino","administrador","vigilante","celadora","aseadora","contador","gerente","otro"] },
        unidadId:                { type: "string", format: "uuid" },
        telefono:                { type: "string" },
        documentoIdentificacion: { type: "string" },
        numeroDocumento:         { type: "string" },
        urlFoto:                 { type: "string" },
      },
    },
    response: { 201: usuarioShape, 400: errorShape, 409: errorShape, 422: validationErrorShape },
  },
};

const updateOpts = {
  schema: {
    tags, summary: "Actualizar usuario", security: [{ bearerAuth: [] }],
    params: idParam,
    body: {
      type: "object",
      properties: {
        nombre:                  { type: "string", minLength: 2 },
        unidadId:                { type: "string", format: "uuid" },
        conjuntoId:              { type: "string", format: "uuid" },
        tipoUsuario:             { type: "string", enum: ["propietario","inquilino","administrador","vigilante","celadora","aseadora","contador","gerente","otro"] },
        telefono:                { type: "string" },
        documentoIdentificacion: { type: "string" },
        numeroDocumento:         { type: "string" },
        urlFoto:                 { type: "string" },
        activo:                  { type: "boolean" },
      },
    },
    response: { 200: usuarioShape, 400: errorShape, 404: errorShape, 422: validationErrorShape },
  },
};

const bloqueoOpts = {
  schema: {
    tags, summary: "Bloquear o desbloquear usuario", security: [{ bearerAuth: [] }],
    params: idParam,
    body: {
      type: "object",
      required: ["bloqueado"],
      properties: {
        bloqueado:     { type: "boolean" },
        razon_bloqueo: { type: "string" },
      },
    },
    response: { 200: usuarioShape, 400: errorShape, 404: errorShape, 422: validationErrorShape },
  },
};

const deleteOpts = {
  schema: {
    tags, summary: "Eliminar usuario (soft delete)", security: [{ bearerAuth: [] }],
    params: idParam,
    response: { 204: { type: "null" }, 400: errorShape, 404: errorShape },
  },
};

// ─── Guards ───────────────────────────────────────────────────────────────────

const adminOnly = [authMiddleware, permitRoles("administrador")];

// ─── Plugin ───────────────────────────────────────────────────────────────────

export default async function usuariosRoutes(app: FastifyInstance) {
  // CRUD principal — solo admin
  app.get(   "/usuarios",                  { ...listOpts,     preHandler: adminOnly }, getUsuarios);
  app.get(   "/usuarios/:id",              { ...getByIdOpts,  preHandler: adminOnly }, getUsuarioById);
  app.post(  "/usuarios",                  { ...createOpts,   preHandler: adminOnly }, createUsuario);
  app.patch( "/usuarios/:id",              { ...updateOpts,   preHandler: adminOnly }, updateUsuario);
  app.delete("/usuarios/:id",              { ...deleteOpts,   preHandler: adminOnly }, deleteUsuario);

  // Acciones especiales — solo admin
  app.patch( "/usuarios/:id/bloqueo",      { ...bloqueoOpts,  preHandler: adminOnly }, setBloqueadoUsuario);

  // Consultas de auditoría y sesiones — solo admin
  app.get(   "/usuarios/:id/audit",        { ...auditOpts,    preHandler: adminOnly }, getUsuarioAuditLog);
  app.get(   "/usuarios/:id/sessions",     { ...sessionsOpts, preHandler: adminOnly }, getUsuarioSessions);
}