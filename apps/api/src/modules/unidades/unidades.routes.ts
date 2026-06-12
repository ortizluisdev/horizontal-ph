import type { FastifyInstance } from "fastify";
import authMiddleware from "../../core/auth/auth.middleware.js";
import permitRoles from "../../core/auth/permissions.guard.js";
import {
  listUnidades,
  listUnidadesByConjunto,
  getUnidadById,
  createUnidad,
  updateUnidad,
  deactivateUnidad,
  deleteUnidad,
} from "./unidades.controller.js";

// ─── Inline schemas ───────────────────────────────────────────────────────────

const tags = ["Unidades"];

const tipoUnidadEnum = ["apartamento","casa","local_comercial","oficina","bodega","parqueadero","otro"];

const unidadShape = {
  type: "object",
  properties: {
    id:               { type: "string", format: "uuid" },
    nombre:           { type: "string" },
    descripcion:      { type: "string" },
    conjunto_id:      { type: "string", format: "uuid" },
    conjunto_nombre:  { type: "string" },
    tipo_unidad:      { type: "string" },
    numero_unidad:    { type: "string" },
    piso:             { type: "number" },
    area_m2:          { type: "number" },
    activo:           { type: "boolean" },
    created_at:       { type: "string", format: "date-time" },
    updated_at:       { type: "string", format: "date-time" },
  },
} as const;

const errorShape = {
  type: "object",
  properties: { message: { type: "string" } },
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

const paginatedShape = {
  type: "object",
  properties: {
    data:  { type: "array", items: unidadShape },
    total: { type: "number" },
    page:  { type: "number" },
    limit: { type: "number" },
    pages: { type: "number" },
  },
} as const;

const idParam = {
  type: "object",
  properties: { id: { type: "string", format: "uuid" } },
} as const;

// ─── Route options ────────────────────────────────────────────────────────────

const listOpts = {
  schema: {
    tags,
    summary: "Listar unidades (paginado + filtros)",
    security: [{ bearerAuth: [] }],
    querystring: {
      type: "object",
      properties: {
        page:        { type: "integer", minimum: 1, default: 1 },
        limit:       { type: "integer", minimum: 1, maximum: 100, default: 20 },
        search:      { type: "string" },
        conjuntoId:  { type: "string", format: "uuid" },
        tipo_unidad: { type: "string", enum: tipoUnidadEnum },
        activo:      { type: "string", enum: ["true", "false"] },
        piso:        { type: "integer" },
      },
    },
    response: { 200: paginatedShape },
  },
};

const listByConjuntoOpts = {
  schema: {
    tags,
    summary: "Listar todas las unidades de un conjunto",
    security: [{ bearerAuth: [] }],
    params: idParam,
    response: {
      200: { type: "array", items: unidadShape },
      404: errorShape,
    },
  },
};

const getByIdOpts = {
  schema: {
    tags,
    summary: "Obtener unidad por ID",
    security: [{ bearerAuth: [] }],
    params: idParam,
    response: {
      200: unidadShape,
      404: errorShape,
    },
  },
};

const createOpts = {
  schema: {
    tags,
    summary: "Crear unidad",
    security: [{ bearerAuth: [] }],
    body: {
      type: "object",
      required: ["conjuntoId", "nombre"],
      properties: {
        conjuntoId:    { type: "string", format: "uuid" },
        nombre:        { type: "string", minLength: 1 },
        descripcion:   { type: "string" },
        tipo_unidad:   { type: "string", enum: tipoUnidadEnum },
        numero_unidad: { type: "string" },
        piso:          { type: "integer" },
        area_m2:       { type: "number" },
      },
    },
    response: {
      201: unidadShape,
      409: errorShape,
      422: validationErrorShape,
    },
  },
};

const updateOpts = {
  schema: {
    tags,
    summary: "Actualizar unidad",
    security: [{ bearerAuth: [] }],
    params: idParam,
    body: {
      type: "object",
      properties: {
        nombre:        { type: "string", minLength: 1 },
        descripcion:   { type: "string" },
        tipo_unidad:   { type: "string", enum: tipoUnidadEnum },
        numero_unidad: { type: "string" },
        piso:          { type: "integer" },
        area_m2:       { type: "number" },
        activo:        { type: "boolean" },
      },
    },
    response: {
      200: unidadShape,
      404: errorShape,
      409: errorShape,
      422: validationErrorShape,
    },
  },
};

const deactivateOpts = {
  schema: {
    tags,
    summary: "Desactivar unidad (soft delete)",
    security: [{ bearerAuth: [] }],
    params: idParam,
    response: {
      200: unidadShape,
      404: errorShape,
    },
  },
};

const deleteOpts = {
  schema: {
    tags,
    summary: "Eliminar unidad (hard delete)",
    security: [{ bearerAuth: [] }],
    params: idParam,
    response: {
      204: { type: "null" },
      404: errorShape,
    },
  },
};

// ─── Guards ───────────────────────────────────────────────────────────────────

const authenticated = [authMiddleware];
const adminOnly     = [authMiddleware, permitRoles("administrador")];

// ─── Plugin ───────────────────────────────────────────────────────────────────

export default async function unidadesRoutes(app: FastifyInstance) {
  // ── Authenticated ──────────────────────────────────────────────────────────
  app.get("/unidades",                          { ...listOpts,          preHandler: authenticated }, listUnidades);
  app.get("/unidades/:id",                      { ...getByIdOpts,       preHandler: authenticated }, getUnidadById);
  app.get("/conjuntos/:id/unidades",            { ...listByConjuntoOpts, preHandler: authenticated }, listUnidadesByConjunto);

  // ── Admin only ─────────────────────────────────────────────────────────────
  app.post(  "/unidades",                       { ...createOpts,        preHandler: adminOnly }, createUnidad);
  app.patch( "/unidades/:id",                   { ...updateOpts,        preHandler: adminOnly }, updateUnidad);
  app.patch( "/unidades/:id/desactivar",        { ...deactivateOpts,    preHandler: adminOnly }, deactivateUnidad);
  app.delete("/unidades/:id",                   { ...deleteOpts,        preHandler: adminOnly }, deleteUnidad);
}