import type { FastifyInstance } from "fastify";
import authMiddleware from "../../core/auth/auth.middleware.js";
import permitRoles from "../../core/auth/permissions.guard.js";
import {
  listNormativas,
  getNormativaById,
  createNormativa,
  updateNormativa,
  deleteNormativa,
} from "./normativa.controller.js";

// ─── Shapes para documentación ────────────────────────────────────────────────

const tags = ["Normativa"];

const normativaShape = {
  type: "object",
  properties: {
    id:             { type: "string", format: "uuid" },
    conjunto_id:    { type: "string", format: "uuid" },
    titulo:         { type: "string" },
    tipo:           { type: "string", enum: ["reglamento", "manual_convivencia", "acuerdo", "resolucion", "circular", "otro"] },
    descripcion:    { type: "string" },
    version:        { type: "string" },
    estado:         { type: "string", enum: ["borrador", "vigente", "derogada", "archivada"] },
    fecha_vigencia: { type: "string", format: "date" },
    documento_url:  { type: "string" },
    activo:         { type: "boolean" },
    created_at:     { type: "string", format: "date-time" },
    updated_at:     { type: "string", format: "date-time" },
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
    data:  { type: "array", items: normativaShape },
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
    tags, summary: "Listar normativas", security: [{ bearerAuth: [] }],
    querystring: {
      type: "object",
      properties: {
        page:       { type: "integer", minimum: 1, default: 1 },
        limit:      { type: "integer", minimum: 1, maximum: 100, default: 20 },
        conjuntoId: { type: "string", format: "uuid" },
        tipo:       { type: "string", enum: ["reglamento", "manual_convivencia", "acuerdo", "resolucion", "circular", "otro"] },
        estado:     { type: "string", enum: ["borrador", "vigente", "derogada", "archivada"] },
        activo:     { type: "boolean" },
      },
    },
    response: { 200: paginatedShape },
  },
};

const getByIdOpts = {
  schema: {
    tags, summary: "Obtener normativa por ID", security: [{ bearerAuth: [] }],
    params: idParam,
    response: { 200: normativaShape, 404: errorShape },
  },
};

const createOpts = {
  schema: {
    tags, summary: "Crear normativa", security: [{ bearerAuth: [] }],
    body: {
      type: "object",
      required: ["conjuntoId", "titulo", "tipo"],
      properties: {
        conjuntoId:     { type: "string", format: "uuid" },
        titulo:         { type: "string", minLength: 3 },
        tipo:           { type: "string", enum: ["reglamento", "manual_convivencia", "acuerdo", "resolucion", "circular", "otro"] },
        descripcion:    { type: "string" },
        contenido:      { type: "string" },
        version:        { type: "string" },
        estado:         { type: "string", enum: ["borrador", "vigente", "derogada", "archivada"] },
        fecha_vigencia: { type: "string", format: "date" },
        documento_url:  { type: "string" },
        activo:         { type: "boolean" },
      },
    },
    response: { 201: normativaShape, 400: errorShape, 403: errorShape, 422: validationErrorShape },
  },
};

const updateOpts = {
  schema: {
    tags, summary: "Actualizar normativa", security: [{ bearerAuth: [] }],
    params: idParam,
    body: {
      type: "object",
      properties: {
        titulo:         { type: "string", minLength: 3 },
        tipo:           { type: "string", enum: ["reglamento", "manual_convivencia", "acuerdo", "resolucion", "circular", "otro"] },
        descripcion:    { type: "string" },
        contenido:      { type: "string" },
        version:        { type: "string" },
        estado:         { type: "string", enum: ["borrador", "vigente", "derogada", "archivada"] },
        fecha_vigencia: { type: "string", format: "date" },
        documento_url:  { type: "string" },
        activo:         { type: "boolean" },
      },
    },
    response: { 200: normativaShape, 400: errorShape, 404: errorShape, 422: validationErrorShape },
  },
};

const deleteOpts = {
  schema: {
    tags, summary: "Eliminar normativa (solo borrador o archivada)", security: [{ bearerAuth: [] }],
    params: idParam,
    response: { 204: { type: "null" }, 400: errorShape, 404: errorShape },
  },
};

// ─── Guards ───────────────────────────────────────────────────────────────────

const authenticated = [authMiddleware];
const adminOnly     = [authMiddleware, permitRoles("administrador")];

// ─── Plugin ───────────────────────────────────────────────────────────────────

export default async function normativaRoutes(app: FastifyInstance) {
  // Autenticados pueden leer
  app.get("/normativa",     { ...listOpts,    preHandler: authenticated }, listNormativas);
  app.get("/normativa/:id", { ...getByIdOpts, preHandler: authenticated }, getNormativaById);

  // Solo administrador puede crear, editar y eliminar
  app.post(  "/normativa",     { ...createOpts, preHandler: adminOnly }, createNormativa);
  app.patch( "/normativa/:id", { ...updateOpts, preHandler: adminOnly }, updateNormativa);
  app.delete("/normativa/:id", { ...deleteOpts, preHandler: adminOnly }, deleteNormativa);
}