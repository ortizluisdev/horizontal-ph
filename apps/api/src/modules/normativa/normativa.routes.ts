import type { FastifyInstance } from "fastify";
import authMiddleware from "../../core/auth/auth.middleware.js";
import permitRoles from "../../core/auth/permissions.guard.js";
import {
  listNormativas,
  getNormativaById,
  createNormativa,
  updateNormativa,
  deactivateNormativa,
  deleteNormativa,
} from "./normativa.controller.js";

// ─── Shapes ───────────────────────────────────────────────────────────────────

const tags = ["Normativa"];

const tipoEnum    = ["reglamento_ph","manual_convivencia","acta_asamblea","resolucion","circular","politica_interna","contrato","ley_decreto","otro"] as const;
const estadoEnum  = ["borrador","en_revision","vigente","derogado","archivado"] as const;
const alcanceEnum = ["todos_propietarios","consejo_administracion","administracion","comite_convivencia","interno"] as const;
const catEnum     = ["ley_675_2001","decreto_reglamentario","codigo_civil","nsr_10","norma_tecnica","reglamento_interno","decision_asamblea","otra"] as const;

const normativaShape = {
  type: "object",
  properties: {
    id:                   { type: "string", format: "uuid" },
    conjunto_id:          { type: "string", format: "uuid" },
    titulo:               { type: "string" },
    tipo:                 { type: "string", enum: tipoEnum },
    categoria_legal:      { type: "string", enum: catEnum },
    estado:               { type: "string", enum: estadoEnum },
    alcance:              { type: "string", enum: alcanceEnum },
    numero_documento:     { type: "string" },
    version:              { type: "string" },
    descripcion:          { type: "string" },
    contenido:            { type: "string" },
    archivo_url:          { type: "string" },
    archivo_nombre:       { type: "string" },
    archivo_tamano:       { type: "number" },
    fecha_emision:        { type: "string" },
    fecha_vigencia_desde: { type: "string" },
    fecha_vigencia_hasta: { type: "string" },
    asamblea_id:          { type: "string" },
    aprobado_por:         { type: "string" },
    tags:                 { type: "array", items: { type: "string" } },
    activo:               { type: "boolean" },
    created_at:           { type: "string", format: "date-time" },
    updated_at:           { type: "string", format: "date-time" },
  },
} as const;

const errorShape     = { type: "object", properties: { message: { type: "string" } } } as const;
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
const idParam        = { type: "object", properties: { id: { type: "string", format: "uuid" } } } as const;

// ─── Guards ───────────────────────────────────────────────────────────────────

const authenticated = [authMiddleware];
const adminOnly     = [authMiddleware, permitRoles("administrador")];

// ─── Plugin ───────────────────────────────────────────────────────────────────

export default async function normativaRoutes(app: FastifyInstance) {
  app.get("/normativa", {
    schema: { tags, summary: "Listar normativas", security: [{ bearerAuth: [] }],
      querystring: { type: "object", properties: {
        page: { type: "integer", minimum: 1, default: 1 },
        limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
        conjuntoId: { type: "string" }, tipo: { type: "string", enum: tipoEnum },
        estado: { type: "string", enum: estadoEnum }, search: { type: "string" },
        activo: { type: "boolean" },
      }},
      response: { 200: paginatedShape },
    },
    preHandler: authenticated,
  }, listNormativas);

  app.get("/normativa/:id", {
    schema: { tags, summary: "Obtener normativa", security: [{ bearerAuth: [] }],
      params: idParam, response: { 200: normativaShape, 404: errorShape },
    },
    preHandler: authenticated,
  }, getNormativaById);

  app.post("/normativa", {
    schema: { tags, summary: "Crear normativa", security: [{ bearerAuth: [] }],
      body: { type: "object", required: ["conjuntoId", "titulo", "tipo"],
        properties: { conjuntoId: { type: "string" }, titulo: { type: "string" }, tipo: { type: "string", enum: tipoEnum } },
      },
      response: { 201: normativaShape, 422: errorShape },
    },
    preHandler: adminOnly,
  }, createNormativa);

  app.patch("/normativa/:id", {
    schema: { tags, summary: "Actualizar normativa", security: [{ bearerAuth: [] }],
      params: idParam, response: { 200: normativaShape, 400: errorShape, 404: errorShape, 422: errorShape },
    },
    preHandler: adminOnly,
  }, updateNormativa);

  app.patch("/normativa/:id/desactivar", {
    schema: { tags, summary: "Desactivar normativa (soft delete)", security: [{ bearerAuth: [] }],
      params: idParam, response: { 204: { type: "null" }, 404: errorShape },
    },
    preHandler: adminOnly,
  }, deactivateNormativa);

  app.delete("/normativa/:id", {
    schema: { tags, summary: "Eliminar normativa (solo borrador o archivado)", security: [{ bearerAuth: [] }],
      params: idParam, response: { 204: { type: "null" }, 400: errorShape, 404: errorShape },
    },
    preHandler: adminOnly,
  }, deleteNormativa);
}
