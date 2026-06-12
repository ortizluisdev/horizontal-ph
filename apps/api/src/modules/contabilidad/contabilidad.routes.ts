import type { FastifyInstance } from "fastify";
import authMiddleware from "../../core/auth/auth.middleware.js";
import permitRoles from "../../core/auth/permissions.guard.js";
import {
  listMovimientos,
  getMovimientoById,
  createMovimiento,
  updateMovimiento,
  anularMovimiento,
  getBalance,
} from "./contabilidad.controller.js";

// ─── Inline schemas ───────────────────────────────────────────────────────────

const tags = ["Contabilidad"];

const TIPOS_MOV   = ["ingreso", "egreso", "ajuste", "traslado", "apertura", "cierre"] as const;
const CATEGORIAS  = [
  "cuota_administracion", "cuota_extraordinaria", "mantenimiento",
  "servicios_publicos", "nomina", "seguros", "impuestos",
  "reparaciones", "arrendamiento", "intereses", "multas", "reservas", "otro",
] as const;
const ESTADOS_MOV = ["activo", "anulado"] as const;

const movimientoShape = {
  type: "object",
  properties: {
    id:                 { type: "string", format: "uuid" },
    conjunto_id:        { type: "string", format: "uuid" },
    numero_asiento:     { type: "string" },
    tipo_movimiento:    { type: "string", enum: TIPOS_MOV },
    categoria:          { type: "string", enum: CATEGORIAS },
    valor_debit:        { type: "number" },
    valor_credit:       { type: "number" },
    descripcion:        { type: "string" },
    fecha_movimiento:   { type: "string", format: "date" },
    referencia_externa: { type: "string" },
    unidad_id:          { type: "string", format: "uuid" },
    cobranza_id:        { type: "string", format: "uuid" },
    estado:             { type: "string", enum: ESTADOS_MOV },
    motivo_anulacion:   { type: "string" },
    created_at:         { type: "string", format: "date-time" },
    updated_at:         { type: "string", format: "date-time" },
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
    data:           { type: "array", items: movimientoShape },
    total:          { type: "number" },
    page:           { type: "number" },
    limit:          { type: "number" },
    pages:          { type: "number" },
    total_debitos:  { type: "number" },
    total_creditos: { type: "number" },
  },
} as const;

const balanceShape = {
  type: "object",
  properties: {
    conjuntoId:     { type: "string", format: "uuid" },
    fechaDesde:     { type: "string", format: "date" },
    fechaHasta:     { type: "string", format: "date" },
    total_debitos:  { type: "number" },
    total_creditos: { type: "number" },
    saldo:          { type: "number" },
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
    summary: "Listar movimientos contables",
    security: [{ bearerAuth: [] }],
    querystring: {
      type: "object",
      properties: {
        page:            { type: "integer", minimum: 1, default: 1 },
        limit:           { type: "integer", minimum: 1, maximum: 100, default: 20 },
        conjuntoId:      { type: "string", format: "uuid" },
        tipo_movimiento: { type: "string", enum: TIPOS_MOV },
        categoria:       { type: "string", enum: CATEGORIAS },
        estado:          { type: "string", enum: ESTADOS_MOV },
        fechaDesde:      { type: "string", format: "date" },
        fechaHasta:      { type: "string", format: "date" },
        unidad_id:       { type: "string", format: "uuid" },
      },
    },
    response: { 200: paginatedShape },
  },
};

const getByIdOpts = {
  schema: {
    tags,
    summary: "Obtener movimiento por ID",
    security: [{ bearerAuth: [] }],
    params: idParam,
    response: {
      200: movimientoShape,
      404: errorShape,
    },
  },
};

const createOpts = {
  schema: {
    tags,
    summary: "Registrar movimiento contable",
    description:
      "Registra un nuevo asiento. Debe ingresar valor_debit O valor_credit (nunca ambos ni ninguno).",
    security: [{ bearerAuth: [] }],
    body: {
      type: "object",
      required: [
        "conjuntoId", "numero_asiento", "tipo_movimiento",
        "categoria", "fecha_movimiento",
      ],
      properties: {
        conjuntoId:         { type: "string", format: "uuid" },
        numero_asiento:     { type: "string", minLength: 1 },
        tipo_movimiento:    { type: "string", enum: TIPOS_MOV },
        categoria:          { type: "string", enum: CATEGORIAS },
        valor_debit:        { type: "number", minimum: 0 },
        valor_credit:       { type: "number", minimum: 0 },
        descripcion:        { type: "string", minLength: 5 },
        fecha_movimiento:   { type: "string", format: "date" },
        referencia_externa: { type: "string" },
        unidad_id:          { type: "string", format: "uuid" },
        cobranza_id:        { type: "string", format: "uuid" },
      },
    },
    response: {
      201: movimientoShape,
      400: errorShape,
      409: errorShape,
      422: validationErrorShape,
    },
  },
};

const updateOpts = {
  schema: {
    tags,
    summary: "Actualizar descripción o referencia del movimiento",
    description:
      "Solo permite editar campos no financieros (descripcion, referencia_externa). Los valores contables son inmutables; use /anular para invalidar el asiento.",
    security: [{ bearerAuth: [] }],
    params: idParam,
    body: {
      type: "object",
      properties: {
        descripcion:        { type: "string", minLength: 5 },
        referencia_externa: { type: "string" },
      },
    },
    response: {
      200: movimientoShape,
      400: errorShape,
      404: errorShape,
      422: validationErrorShape,
    },
  },
};

const anularOpts = {
  schema: {
    tags,
    summary: "Anular movimiento contable",
    description:
      "Anula un movimiento de forma irreversible. Los movimientos contables nunca se eliminan físicamente.",
    security: [{ bearerAuth: [] }],
    params: idParam,
    body: {
      type: "object",
      required: ["motivo_anulacion"],
      properties: {
        motivo_anulacion: { type: "string", minLength: 10 },
      },
    },
    response: {
      200: movimientoShape,
      400: errorShape,
      404: errorShape,
      422: validationErrorShape,
    },
  },
};

const balanceOpts = {
  schema: {
    tags,
    summary: "Balance de movimientos por período",
    description:
      "Retorna la sumatoria de débitos, créditos y saldo neto para un conjunto en un rango de fechas. Solo incluye movimientos activos.",
    security: [{ bearerAuth: [] }],
    querystring: {
      type: "object",
      required: ["conjuntoId", "fechaDesde", "fechaHasta"],
      properties: {
        conjuntoId: { type: "string", format: "uuid" },
        fechaDesde: { type: "string", format: "date" },
        fechaHasta: { type: "string", format: "date" },
      },
    },
    response: {
      200: balanceShape,
      400: errorShape,
      422: validationErrorShape,
    },
  },
};

// ─── Guards ───────────────────────────────────────────────────────────────────

const authenticated = [authMiddleware];
const adminOnly     = [authMiddleware, permitRoles("administrador")];

// ─── Plugin ───────────────────────────────────────────────────────────────────

export default async function contabilidadRoutes(app: FastifyInstance) {
  // ── Authenticated (lectura) ───────────────────────────────────────────────
  app.get("/contabilidad",         { ...listOpts,    preHandler: authenticated }, listMovimientos);
  app.get("/contabilidad/balance", { ...balanceOpts, preHandler: authenticated }, getBalance);
  app.get("/contabilidad/:id",     { ...getByIdOpts, preHandler: authenticated }, getMovimientoById);

  // ── Admin only (escritura) ────────────────────────────────────────────────
  app.post(  "/contabilidad",              { ...createOpts, preHandler: adminOnly }, createMovimiento);
  app.patch( "/contabilidad/:id",          { ...updateOpts, preHandler: adminOnly }, updateMovimiento);
  app.patch( "/contabilidad/:id/anular",   { ...anularOpts, preHandler: adminOnly }, anularMovimiento);
}