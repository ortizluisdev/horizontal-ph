import type { FastifyInstance } from "fastify";
import authMiddleware from "../../core/auth/auth.middleware.js";
import permitRoles from "../../core/auth/permissions.guard.js";
import {
  listNotificaciones,
  getNotificacionById,
  createNotificacion,
  updateNotificacion,
  deleteNotificacion,
} from "./notificacion.controller.js";

// ─── Shapes ───────────────────────────────────────────────────────────────────

const tags = ["Notificaciones"];

const notificacionShape = {
  type: "object",
  properties: {
    id:                    { type: "string", format: "uuid" },
    conjunto_id:           { type: "string", format: "uuid" },
    usuario_id:            { type: "string", format: "uuid" },
    template_id:           { type: "string", format: "uuid" },
    tipo:                  { type: "string", enum: ["pago", "mantenimiento", "asamblea", "seguridad", "informativo", "otro"] },
    titulo:                { type: "string" },
    contenido:             { type: "string" },
    estado:                { type: "string", enum: ["pendiente", "enviada", "entregada", "leida", "fallida"] },
    canal_envio:           { type: "string", enum: ["email", "sms", "push", "whatsapp", "otro"] },
    fecha_programada:      { type: "string", format: "date-time" },
    fecha_envio:           { type: "string", format: "date-time" },
    fecha_entrega:         { type: "string", format: "date-time" },
    fecha_lectura:         { type: "string", format: "date-time" },
    importante:            { type: "boolean" },
    urgente:               { type: "boolean" },
    requiere_confirmacion: { type: "boolean" },
    confirmada:            { type: "boolean" },
    numero_reintentos:     { type: "integer" },
    max_reintentos:        { type: "integer" },
    destinatarios:         { type: "array", items: { type: "string" } },
    created_at:            { type: "string", format: "date-time" },
    updated_at:            { type: "string", format: "date-time" },
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
    data:  { type: "array", items: notificacionShape },
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
    tags, summary: "Listar notificaciones", security: [{ bearerAuth: [] }],
    querystring: {
      type: "object",
      properties: {
        page:       { type: "integer", minimum: 1, default: 1 },
        limit:      { type: "integer", minimum: 1, maximum: 100, default: 20 },
        conjuntoId: { type: "string", format: "uuid" },
        usuarioId:  { type: "string", format: "uuid" },
        tipo:       { type: "string", enum: ["pago", "mantenimiento", "asamblea", "seguridad", "informativo", "otro"] },
        estado:     { type: "string", enum: ["pendiente", "enviada", "entregada", "leida", "fallida"] },
        canal:      { type: "string", enum: ["email", "sms", "push", "whatsapp", "otro"] },
        importante: { type: "boolean" },
        urgente:    { type: "boolean" },
        fechaDesde: { type: "string", format: "date-time" },
        fechaHasta: { type: "string", format: "date-time" },
      },
    },
    response: { 200: paginatedShape },
  },
};

const getByIdOpts = {
  schema: {
    tags, summary: "Obtener notificación por ID", security: [{ bearerAuth: [] }],
    params: idParam,
    response: { 200: notificacionShape, 404: errorShape },
  },
};

const createOpts = {
  schema: {
    tags, summary: "Crear notificación", security: [{ bearerAuth: [] }],
    body: {
      type: "object",
      required: ["conjuntoId", "tipo", "titulo", "contenido"],
      properties: {
        conjuntoId:            { type: "string", format: "uuid" },
        usuarioId:             { type: "string", format: "uuid" },
        templateId:            { type: "string", format: "uuid" },
        tipo:                  { type: "string", enum: ["pago", "mantenimiento", "asamblea", "seguridad", "informativo", "otro"] },
        titulo:                { type: "string", minLength: 3 },
        contenido:             { type: "string", minLength: 5 },
        canal_envio:           { type: "string", enum: ["email", "sms", "push", "whatsapp", "otro"] },
        fecha_programada:      { type: "string", format: "date-time" },
        importante:            { type: "boolean" },
        urgente:               { type: "boolean" },
        requiere_confirmacion: { type: "boolean" },
        max_reintentos:        { type: "integer", minimum: 0, maximum: 10 },
        destinatarios:         { type: "array", items: { type: "string" } },
      },
    },
    response: { 201: notificacionShape, 400: errorShape, 403: errorShape, 422: validationErrorShape },
  },
};

const updateOpts = {
  schema: {
    tags, summary: "Actualizar estado de notificación", security: [{ bearerAuth: [] }],
    params: idParam,
    body: {
      type: "object",
      properties: {
        estado:        { type: "string", enum: ["pendiente", "enviada", "entregada", "leida", "fallida"] },
        razon_fallo:   { type: "string" },
        confirmada:    { type: "boolean" },
        fecha_lectura: { type: "string", format: "date-time" },
        fecha_entrega: { type: "string", format: "date-time" },
        importante:    { type: "boolean" },
        urgente:       { type: "boolean" },
      },
    },
    response: { 200: notificacionShape, 400: errorShape, 404: errorShape, 422: validationErrorShape },
  },
};

const deleteOpts = {
  schema: {
    tags, summary: "Eliminar notificación (solo pendiente o fallida)", security: [{ bearerAuth: [] }],
    params: idParam,
    response: { 204: { type: "null" }, 400: errorShape, 404: errorShape },
  },
};

// ─── Guards ───────────────────────────────────────────────────────────────────

const authenticated = [authMiddleware];
const adminOnly     = [authMiddleware, permitRoles("administrador")];

// ─── Plugin ───────────────────────────────────────────────────────────────────

export default async function notificacionesRoutes(app: FastifyInstance) {
  // Todos los autenticados pueden ver sus notificaciones
  app.get("/notificaciones",     { ...listOpts,    preHandler: authenticated }, listNotificaciones);
  app.get("/notificaciones/:id", { ...getByIdOpts, preHandler: authenticated }, getNotificacionById);

  // Solo admin puede crear y eliminar
  app.post(  "/notificaciones",     { ...createOpts, preHandler: adminOnly }, createNotificacion);
  app.patch( "/notificaciones/:id", { ...updateOpts, preHandler: authenticated }, updateNotificacion);
  app.delete("/notificaciones/:id", { ...deleteOpts, preHandler: adminOnly }, deleteNotificacion);
}