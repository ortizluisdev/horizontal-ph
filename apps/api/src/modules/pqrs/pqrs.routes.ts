import type { FastifyInstance } from "fastify";
import authMiddleware from "../../core/auth/auth.middleware.js";
import permitRoles from "../../core/auth/permissions.guard.js";
import {
  listPqrs,
  getPqrsById,
  getPqrsSeguimiento,
  createPqrs,
  updatePqrs,
  deletePqrs,
} from "./pqrs.controller.js";

// ─── Shapes ───────────────────────────────────────────────────────────────────

const tags = ["PQRS"];

const pqrsShape = {
  type: "object",
  properties: {
    id:                          { type: "string", format: "uuid" },
    conjunto_id:                 { type: "string", format: "uuid" },
    unidad_id:                   { type: "string", format: "uuid" },
    usuario_id:                  { type: "string", format: "uuid" },
    numero_radicado:             { type: "string" },
    tipo:                        { type: "string", enum: ["peticion", "queja", "reclamo", "sugerencia"] },
    asunto:                      { type: "string" },
    descripcion:                 { type: "string" },
    categoria:                   { type: "string", enum: ["infraestructura", "servicios", "seguridad", "convivencia", "otro"] },
    prioridad:                   { type: "string", enum: ["baja", "normal", "alta", "urgente"] },
    estado:                      { type: "string", enum: ["abierta", "en_proceso", "resuelta", "cerrada", "archivada"] },
    fecha_radicacion:            { type: "string", format: "date-time" },
    fecha_respuesta:             { type: "string", format: "date-time" },
    fecha_cierre:                { type: "string", format: "date-time" },
    tiempo_resolucion_dias:      { type: "integer" },
    nombre_solicitante:          { type: "string" },
    email_solicitante:           { type: "string" },
    responsable_asignado_nombre: { type: "string" },
    calificacion_satisfaccion:   { type: "integer" },
    requiere_seguimiento:        { type: "boolean" },
    fecha_proximo_seguimiento:   { type: "string", format: "date" },
    ubicacion_afectada:          { type: "string" },
    activo:                      { type: "boolean" },
    created_at:                  { type: "string", format: "date-time" },
    updated_at:                  { type: "string", format: "date-time" },
  },
} as const;

const seguimientoShape = {
  type: "array",
  items: {
    type: "object",
    properties: {
      id:              { type: "string", format: "uuid" },
      accion:          { type: "string" },
      descripcion:     { type: "string" },
      estado_anterior: { type: "string" },
      estado_nuevo:    { type: "string" },
      usuario_nombre:  { type: "string" },
      fecha_cambio:    { type: "string", format: "date-time" },
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
    data:  { type: "array", items: pqrsShape },
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
    tags, summary: "Listar PQRS", security: [{ bearerAuth: [] }],
    querystring: {
      type: "object",
      properties: {
        page:           { type: "integer", minimum: 1, default: 1 },
        limit:          { type: "integer", minimum: 1, maximum: 100, default: 20 },
        conjuntoId:     { type: "string", format: "uuid" },
        unidadId:       { type: "string", format: "uuid" },
        tipo:           { type: "string", enum: ["peticion", "queja", "reclamo", "sugerencia"] },
        estado:         { type: "string", enum: ["abierta", "en_proceso", "resuelta", "cerrada", "archivada"] },
        prioridad:      { type: "string", enum: ["baja", "normal", "alta", "urgente"] },
        categoria:      { type: "string", enum: ["infraestructura", "servicios", "seguridad", "convivencia", "otro"] },
        fechaDesde:     { type: "string", format: "date-time" },
        fechaHasta:     { type: "string", format: "date-time" },
        numeroRadicado: { type: "string" },
      },
    },
    response: { 200: paginatedShape },
  },
};

const getByIdOpts = {
  schema: {
    tags, summary: "Obtener PQRS por ID", security: [{ bearerAuth: [] }],
    params: idParam,
    response: { 200: pqrsShape, 404: errorShape },
  },
};

const getSeguimientoOpts = {
  schema: {
    tags, summary: "Historial de seguimiento de una PQRS", security: [{ bearerAuth: [] }],
    params: idParam,
    response: { 200: seguimientoShape, 404: errorShape },
  },
};

const createOpts = {
  schema: {
    tags, summary: "Radicar nueva PQRS", security: [{ bearerAuth: [] }],
    body: {
      type: "object",
      required: ["conjuntoId", "unidadId", "tipo", "asunto", "descripcion"],
      properties: {
        conjuntoId:               { type: "string", format: "uuid" },
        unidadId:                 { type: "string", format: "uuid" },
        usuarioId:                { type: "string", format: "uuid" },
        tipo:                     { type: "string", enum: ["peticion", "queja", "reclamo", "sugerencia"] },
        asunto:                   { type: "string", minLength: 5 },
        descripcion:              { type: "string", minLength: 10 },
        categoria:                { type: "string", enum: ["infraestructura", "servicios", "seguridad", "convivencia", "otro"] },
        prioridad:                { type: "string", enum: ["baja", "normal", "alta", "urgente"] },
        nombre_solicitante:       { type: "string" },
        email_solicitante:        { type: "string", format: "email" },
        telefono_solicitante:     { type: "string" },
        ubicacion_afectada:       { type: "string" },
        evidencia_foto_url:       { type: "string" },
        requiere_seguimiento:     { type: "boolean" },
        fecha_proximo_seguimiento:{ type: "string", format: "date" },
      },
    },
    response: { 201: pqrsShape, 400: errorShape, 403: errorShape, 422: validationErrorShape },
  },
};

const updateOpts = {
  schema: {
    tags, summary: "Actualizar PQRS", security: [{ bearerAuth: [] }],
    params: idParam,
    body: {
      type: "object",
      properties: {
        estado:                      { type: "string", enum: ["abierta", "en_proceso", "resuelta", "cerrada", "archivada"] },
        prioridad:                   { type: "string", enum: ["baja", "normal", "alta", "urgente"] },
        categoria:                   { type: "string", enum: ["infraestructura", "servicios", "seguridad", "convivencia", "otro"] },
        responsable_asignado_id:     { type: "string", format: "uuid" },
        responsable_asignado_nombre: { type: "string" },
        respuesta_descripcion:       { type: "string" },
        requiere_seguimiento:        { type: "boolean" },
        fecha_proximo_seguimiento:   { type: "string", format: "date" },
        observaciones_internas:      { type: "string" },
        calificacion_satisfaccion:   { type: "integer", minimum: 1, maximum: 5 },
        comentario_satisfaccion:     { type: "string" },
      },
    },
    response: { 200: pqrsShape, 400: errorShape, 404: errorShape, 422: validationErrorShape },
  },
};

const deleteOpts = {
  schema: {
    tags, summary: "Eliminar PQRS (solo archivadas)", security: [{ bearerAuth: [] }],
    params: idParam,
    response: { 204: { type: "null" }, 400: errorShape, 404: errorShape },
  },
};

// ─── Guards ───────────────────────────────────────────────────────────────────

const authenticated = [authMiddleware];
const adminOnly     = [authMiddleware, permitRoles("administrador")];

// ─── Plugin ───────────────────────────────────────────────────────────────────

export default async function pqrsRoutes(app: FastifyInstance) {
  // Todos los autenticados pueden radicar y consultar
  app.get( "/pqrs",                    { ...listOpts,           preHandler: authenticated }, listPqrs);
  app.get( "/pqrs/:id",                { ...getByIdOpts,        preHandler: authenticated }, getPqrsById);
  app.get( "/pqrs/:id/seguimiento",    { ...getSeguimientoOpts, preHandler: authenticated }, getPqrsSeguimiento);
  app.post("/pqrs",                    { ...createOpts,         preHandler: authenticated }, createPqrs);

  // Solo admin puede gestionar, asignar y eliminar
  app.patch( "/pqrs/:id", { ...updateOpts, preHandler: adminOnly }, updatePqrs);
  app.delete("/pqrs/:id", { ...deleteOpts, preHandler: adminOnly }, deletePqrs);
}