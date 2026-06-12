import type { FastifyInstance } from "fastify";
import authMiddleware from "../../core/auth/auth.middleware.js";
import permitRoles from "../../core/auth/permissions.guard.js";
import {
  listConjuntos,
  getConjuntoById,
  createConjunto,
  updateConjunto,
  deactivateConjunto,
  deleteConjunto,
} from "./conjunto.controller.js";

// ─── Inline schemas ───────────────────────────────────────────────────────────

const tags = ["Conjuntos"];

const conjuntoShape = {
  type: "object",
  properties: {
    id:            { type: "string", format: "uuid" },
    nombre:        { type: "string" },
    direccion:     { type: "string" },
    ciudad:        { type: "string" },
    tipo_conjunto: { type: "string" },
    activo:        { type: "boolean" },
    tenant_id:     { type: "string", format: "uuid" },
    created_at:    { type: "string", format: "date-time" },
    updated_at:    { type: "string", format: "date-time" },
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
    data:  { type: "array", items: conjuntoShape },
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
    summary: "Listar conjuntos",
    security: [{ bearerAuth: [] }],
    querystring: {
      type: "object",
      properties: {
        page:          { type: "integer", minimum: 1, default: 1 },
        limit:         { type: "integer", minimum: 1, maximum: 100, default: 20 },
        search:        { type: "string" },
        tipo_conjunto: { type: "string", enum: ["residencial","comercial","mixto","industrial","otro"] },
        activo:        { type: "string", enum: ["true","false"] },
      },
    },
    response: {
      200: paginatedShape,
    },
  },
};

const getByIdOpts = {
  schema: {
    tags,
    summary: "Obtener conjunto por ID",
    security: [{ bearerAuth: [] }],
    params: idParam,
    response: {
      200: conjuntoShape,
      404: errorShape,
    },
  },
};

const createOpts = {
  schema: {
    tags,
    summary: "Crear conjunto",
    security: [{ bearerAuth: [] }],
    body: {
      type: "object",
      required: ["tenantId", "nombre", "direccion"],
      properties: {
        tenantId:      { type: "string", format: "uuid" },
        nombre:        { type: "string", minLength: 2 },
        direccion:     { type: "string", minLength: 5 },
        ciudad:        { type: "string" },
        tipo_conjunto: { type: "string", enum: ["residencial","comercial","mixto","industrial","otro"] },
      },
    },
    response: {
      201: conjuntoShape,
      409: errorShape,
      422: validationErrorShape,
    },
  },
};

const updateOpts = {
  schema: {
    tags,
    summary: "Actualizar conjunto",
    security: [{ bearerAuth: [] }],
    params: idParam,
    body: {
      type: "object",
      properties: {
        nombre:        { type: "string", minLength: 2 },
        direccion:     { type: "string", minLength: 5 },
        ciudad:        { type: "string" },
        tipo_conjunto: { type: "string", enum: ["residencial","comercial","mixto","industrial","otro"] },
        activo:        { type: "boolean" },
      },
    },
    response: {
      200: conjuntoShape,
      404: errorShape,
      409: errorShape,
      422: validationErrorShape,
    },
  },
};

const deactivateOpts = {
  schema: {
    tags,
    summary: "Desactivar conjunto (soft delete)",
    security: [{ bearerAuth: [] }],
    params: idParam,
    response: {
      200: conjuntoShape,
      404: errorShape,
    },
  },
};

const deleteOpts = {
  schema: {
    tags,
    summary: "Eliminar conjunto (hard delete)",
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

export default async function conjuntosRoutes(app: FastifyInstance) {
  // ── Authenticated ──────────────────────────────────────────────────────────
  app.get("/conjuntos",        { ...listOpts,       preHandler: authenticated }, listConjuntos);
  app.get("/conjuntos/:id",    { ...getByIdOpts,    preHandler: authenticated }, getConjuntoById);

  // ── Admin only ─────────────────────────────────────────────────────────────
  app.post(  "/conjuntos",              { ...createOpts,     preHandler: adminOnly }, createConjunto);
  app.patch( "/conjuntos/:id",          { ...updateOpts,     preHandler: adminOnly }, updateConjunto);
  app.patch( "/conjuntos/:id/desactivar", { ...deactivateOpts, preHandler: adminOnly }, deactivateConjunto);
  app.delete("/conjuntos/:id",          { ...deleteOpts,     preHandler: adminOnly }, deleteConjunto);
}