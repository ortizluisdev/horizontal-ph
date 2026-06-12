import type { FastifyInstance } from "fastify";
import authMiddleware from "../../core/auth/auth.middleware.js";
import permitRoles from "../../core/auth/permissions.guard.js";
import {
  listAsambleas,
  getAsambleaById,
  createAsamblea,
  updateAsamblea,
  deleteAsamblea,
} from "./asamblea.controller.js";

// ─── Inline schemas ───────────────────────────────────────────────────────────

const tags = ["Asambleas"];

const asambleaShape = {
  type: "object",
  properties: {
    id:               { type: "string", format: "uuid" },
    conjunto_id:      { type: "string", format: "uuid" },
    numero_acta:      { type: "string" },
    tipo:             { type: "string", enum: ["ordinaria", "extraordinaria", "de_propietarios", "de_consejo", "otra"] },
    asunto:           { type: "string" },
    fecha_programada: { type: "string", format: "date-time" },
    lugar:            { type: "string" },
    quorum_requerido: { type: "integer" },
    estado:           { type: "string", enum: ["programada", "en_curso", "realizada", "cancelada", "pospuesta"] },
    notas:            { type: "string" },
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
    data:  { type: "array", items: asambleaShape },
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
    summary: "Listar asambleas",
    security: [{ bearerAuth: [] }],
    querystring: {
      type: "object",
      properties: {
        page:       { type: "integer", minimum: 1, default: 1 },
        limit:      { type: "integer", minimum: 1, maximum: 100, default: 20 },
        conjuntoId: { type: "string", format: "uuid" },
        tipo:       { type: "string", enum: ["ordinaria", "extraordinaria", "de_propietarios", "de_consejo", "otra"] },
        estado:     { type: "string", enum: ["programada", "en_curso", "realizada", "cancelada", "pospuesta"] },
        fechaDesde: { type: "string", format: "date-time" },
        fechaHasta: { type: "string", format: "date-time" },
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
    summary: "Obtener asamblea por ID",
    security: [{ bearerAuth: [] }],
    params: idParam,
    response: {
      200: asambleaShape,
      404: errorShape,
    },
  },
};

const createOpts = {
  schema: {
    tags,
    summary: "Crear asamblea",
    security: [{ bearerAuth: [] }],
    body: {
      type: "object",
      required: ["conjuntoId", "numero_acta", "tipo", "asunto", "fecha_programada"],
      properties: {
        conjuntoId:       { type: "string", format: "uuid" },
        numero_acta:      { type: "string", minLength: 1 },
        tipo:             { type: "string", enum: ["ordinaria", "extraordinaria", "de_propietarios", "de_consejo", "otra"] },
        asunto:           { type: "string", minLength: 5 },
        fecha_programada: { type: "string", format: "date-time" },
        lugar:            { type: "string" },
        quorum_requerido: { type: "integer", minimum: 1, maximum: 100 },
        notas:            { type: "string" },
      },
    },
    response: {
      201: asambleaShape,
      400: errorShape,
      409: errorShape,
      422: validationErrorShape,
    },
  },
};

const updateOpts = {
  schema: {
    tags,
    summary: "Actualizar asamblea",
    security: [{ bearerAuth: [] }],
    params: idParam,
    body: {
      type: "object",
      properties: {
        numero_acta:      { type: "string", minLength: 1 },
        tipo:             { type: "string", enum: ["ordinaria", "extraordinaria", "de_propietarios", "de_consejo", "otra"] },
        asunto:           { type: "string", minLength: 5 },
        fecha_programada: { type: "string", format: "date-time" },
        lugar:            { type: "string" },
        quorum_requerido: { type: "integer", minimum: 1, maximum: 100 },
        notas:            { type: "string" },
        estado:           { type: "string", enum: ["programada", "en_curso", "realizada", "cancelada", "pospuesta"] },
      },
    },
    response: {
      200: asambleaShape,
      400: errorShape,
      404: errorShape,
      409: errorShape,
      422: validationErrorShape,
    },
  },
};

const deleteOpts = {
  schema: {
    tags,
    summary: "Eliminar asamblea (solo programada o cancelada)",
    security: [{ bearerAuth: [] }],
    params: idParam,
    response: {
      204: { type: "null" },
      400: errorShape,
      404: errorShape,
    },
  },
};

// ─── Guards ───────────────────────────────────────────────────────────────────

const authenticated = [authMiddleware];
const adminOnly     = [authMiddleware, permitRoles("administrador")];

// ─── Plugin ───────────────────────────────────────────────────────────────────

export default async function asambleasRoutes(app: FastifyInstance) {
  // ── Authenticated ─────────────────────────────────────────────────────────
  app.get("/asambleas",     { ...listOpts,    preHandler: authenticated }, listAsambleas);
  app.get("/asambleas/:id", { ...getByIdOpts, preHandler: authenticated }, getAsambleaById);

  // ── Admin only ────────────────────────────────────────────────────────────
  app.post(  "/asambleas",     { ...createOpts, preHandler: adminOnly }, createAsamblea);
  app.patch( "/asambleas/:id", { ...updateOpts, preHandler: adminOnly }, updateAsamblea);
  app.delete("/asambleas/:id", { ...deleteOpts, preHandler: adminOnly }, deleteAsamblea);
}