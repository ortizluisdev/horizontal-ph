import type { FastifyInstance } from 'fastify';
import authMiddleware from '../../core/auth/auth.middleware.js';
import permitRoles from '../../core/auth/permissions.guard.js';
import {
  listCobranzas,
  getCobranzaById,
  createCobranza,
  updateCobranza,
  deleteCobranza,
} from './cobranza.controller.js';

// ─── Shapes ───────────────────────────────────────────────────────────────────

const tags = ['Cobranza'];

const ESTADO_ENUM  = ['pendiente', 'pagado', 'parcial', 'vencido', 'cancelado'];
const METODO_ENUM  = ['efectivo', 'transferencia', 'tarjeta', 'cheque', 'otro'];

const cobranzaShape = {
  type: 'object',
  properties: {
    id:                    { type: 'string', format: 'uuid' },
    unidad_id:             { type: 'string', format: 'uuid' },
    conjunto_id:           { type: 'string', format: 'uuid' },
    numero_recibo:         { type: 'string' },
    concepto:              { type: 'string' },
    descripcion:           { type: 'string', nullable: true },
    valor_base:            { type: 'number' },
    valor_impuesto:        { type: 'number' },
    valor_total:           { type: 'number' },
    valor_pagado:          { type: 'number' },
    valor_deuda:           { type: 'number', nullable: true },
    mes_facturacion:       { type: 'integer', nullable: true },
    anio_facturacion:      { type: 'integer', nullable: true },
    fecha_emision:         { type: 'string', format: 'date' },
    fecha_vencimiento:     { type: 'string', format: 'date' },
    fecha_pago:            { type: 'string', format: 'date', nullable: true },
    metodo_pago:           { type: 'string', enum: METODO_ENUM, nullable: true },
    estado:                { type: 'string', enum: ESTADO_ENUM },
    referencia_pago:       { type: 'string', nullable: true },
    observaciones:         { type: 'string', nullable: true },
    enviado_cobrador:      { type: 'boolean' },
    fecha_envio_cobrador:  { type: 'string', format: 'date', nullable: true },
    activo:                { type: 'boolean' },
    created_at:            { type: 'string', format: 'date-time' },
    updated_at:            { type: 'string', format: 'date-time' },
  },
} as const;

const errorShape = {
  type: 'object',
  properties: { message: { type: 'string' } },
} as const;

const validationErrorShape = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          field:   { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  },
} as const;

const paginatedShape = {
  type: 'object',
  properties: {
    data:  { type: 'array', items: cobranzaShape },
    total: { type: 'integer' },
    page:  { type: 'integer' },
    limit: { type: 'integer' },
    pages: { type: 'integer' },
  },
} as const;

const idParam = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
} as const;

// ─── Route option objects ─────────────────────────────────────────────────────

const listOpts = {
  schema: {
    tags,
    summary: 'Listar cobranzas',
    security: [{ bearerAuth: [] }],
    querystring: {
      type: 'object',
      properties: {
        page:       { type: 'integer', minimum: 1, default: 1 },
        limit:      { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        conjuntoId: { type: 'string', format: 'uuid' },
        unidadId:   { type: 'string', format: 'uuid' },
        estado:     { type: 'string', enum: ESTADO_ENUM },
        fechaDesde: { type: 'string', format: 'date' },
        fechaHasta: { type: 'string', format: 'date' },
        search:     { type: 'string' },
      },
    },
    response: { 200: paginatedShape },
  },
};

const getByIdOpts = {
  schema: {
    tags,
    summary: 'Obtener cobranza por ID',
    security: [{ bearerAuth: [] }],
    params: idParam,
    response: { 200: cobranzaShape, 404: errorShape },
  },
};

const createOpts = {
  schema: {
    tags,
    summary: 'Crear cobranza',
    security: [{ bearerAuth: [] }],
    body: {
      type: 'object',
      required: ['unidadId', 'conjuntoId', 'numero_recibo', 'concepto', 'valor_base', 'valor_total', 'fecha_vencimiento'],
      properties: {
        unidadId:         { type: 'string', format: 'uuid' },
        conjuntoId:       { type: 'string', format: 'uuid' },
        numero_recibo:    { type: 'string', minLength: 1, maxLength: 50 },
        concepto:         { type: 'string', minLength: 1, maxLength: 300 },
        descripcion:      { type: 'string', maxLength: 500 },
        valor_base:       { type: 'number', exclusiveMinimum: 0 },
        valor_impuesto:   { type: 'number', minimum: 0 },
        valor_total:      { type: 'number', exclusiveMinimum: 0 },
        mes_facturacion:  { type: 'integer', minimum: 1, maximum: 12 },
        anio_facturacion: { type: 'integer', minimum: 2000 },
        fecha_emision:    { type: 'string', format: 'date' },
        fecha_vencimiento:{ type: 'string', format: 'date' },
      },
    },
    response: { 201: cobranzaShape, 409: errorShape, 422: validationErrorShape },
  },
};

const updateOpts = {
  schema: {
    tags,
    summary: 'Actualizar cobranza',
    security: [{ bearerAuth: [] }],
    params: idParam,
    body: {
      type: 'object',
      properties: {
        concepto:          { type: 'string', minLength: 1, maxLength: 300 },
        descripcion:       { type: 'string', maxLength: 500 },
        valor_base:        { type: 'number', exclusiveMinimum: 0 },
        valor_impuesto:    { type: 'number', minimum: 0 },
        valor_total:       { type: 'number', exclusiveMinimum: 0 },
        valor_pagado:      { type: 'number', minimum: 0 },
        fecha_vencimiento: { type: 'string', format: 'date' },
        fecha_pago:        { type: 'string', format: 'date' },
        metodo_pago:       { type: 'string', enum: METODO_ENUM },
        referencia_pago:   { type: 'string', maxLength: 200 },
        observaciones:     { type: 'string', maxLength: 500 },
        estado:            { type: 'string', enum: ESTADO_ENUM },
      },
    },
    response: {
      200: cobranzaShape,
      400: errorShape,
      404: errorShape,
      422: validationErrorShape,
    },
  },
};

const deleteOpts = {
  schema: {
    tags,
    summary: 'Eliminar cobranza (solo pendiente o cancelada)',
    security: [{ bearerAuth: [] }],
    params: idParam,
    response: { 204: { type: 'null' }, 400: errorShape, 404: errorShape },
  },
};

// ─── Guards ───────────────────────────────────────────────────────────────────

const authenticated = [authMiddleware];
const adminOnly     = [authMiddleware, permitRoles('administrador')];

// ─── Plugin ───────────────────────────────────────────────────────────────────

export default async function cobranzaRoutes(app: FastifyInstance) {
  app.get('/cobranza',     { ...listOpts,    preHandler: authenticated }, listCobranzas);
  app.get('/cobranza/:id', { ...getByIdOpts, preHandler: authenticated }, getCobranzaById);

  app.post(  '/cobranza',     { ...createOpts, preHandler: adminOnly }, createCobranza);
  app.patch( '/cobranza/:id', { ...updateOpts, preHandler: adminOnly }, updateCobranza);
  app.delete('/cobranza/:id', { ...deleteOpts, preHandler: adminOnly }, deleteCobranza);
}