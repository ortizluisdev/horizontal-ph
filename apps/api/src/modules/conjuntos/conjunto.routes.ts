import type { FastifyInstance } from 'fastify';
import authMiddleware from '../../core/auth/auth.middleware.js';
import permitRoles from '../../core/auth/permissions.guard.js';
import {
  listConjuntos,
  getConjuntoById,
  createConjunto,
  updateConjunto,
  deactivateConjunto,
  deleteConjunto,
} from './conjunto.controller.js';

// ─── Shared shapes ────────────────────────────────────────────────────────────

const tags = ['Conjuntos'];

const TIPO_ENUM = ['edificio', 'casa', 'ciudadela', 'condominio', 'otro'];

const conjuntoShape = {
  type: 'object',
  properties: {
    id:                      { type: 'string', format: 'uuid' },
    tenant_id:               { type: 'string', format: 'uuid' },
    nombre:                  { type: 'string' },
    direccion:               { type: 'string' },
    ciudad:                  { type: 'string', nullable: true },
    departamento:            { type: 'string', nullable: true },
    pais:                    { type: 'string', nullable: true },
    codigo_catastral:        { type: 'string', nullable: true },
    tipo_conjunto:           { type: 'string', enum: TIPO_ENUM },
    numero_torres:           { type: 'integer', nullable: true },
    numero_unidades:         { type: 'integer', nullable: true },
    anio_construccion:       { type: 'integer', nullable: true },
    area_total_m2:           { type: 'number', nullable: true },
    area_comun_m2:           { type: 'number', nullable: true },
    administrador_nombre:    { type: 'string', nullable: true },
    administrador_email:     { type: 'string', nullable: true },
    administrador_telefono:  { type: 'string', nullable: true },
    telefono_emergencia:     { type: 'string', nullable: true },
    email_contacto:          { type: 'string', nullable: true },
    logo_url:                { type: 'string', nullable: true },
    activo:                  { type: 'boolean' },
    created_at:              { type: 'string', format: 'date-time' },
    updated_at:              { type: 'string', format: 'date-time' },
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
    data:  { type: 'array', items: conjuntoShape },
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

const createBodyShape = {
  type: 'object',
  required: ['tenantId', 'nombre', 'direccion', 'tipo_conjunto'],
  properties: {
    tenantId:                { type: 'string', format: 'uuid' },
    nombre:                  { type: 'string', minLength: 2, maxLength: 200 },
    direccion:               { type: 'string', minLength: 5, maxLength: 300 },
    ciudad:                  { type: 'string' },
    departamento:            { type: 'string' },
    pais:                    { type: 'string' },
    codigo_catastral:        { type: 'string' },
    tipo_conjunto:           { type: 'string', enum: TIPO_ENUM },
    numero_torres:           { type: 'integer', minimum: 1 },
    numero_unidades:         { type: 'integer', minimum: 1 },
    anio_construccion:       { type: 'integer', minimum: 1800 },
    area_total_m2:           { type: 'number', minimum: 0 },
    area_comun_m2:           { type: 'number', minimum: 0 },
    administrador_nombre:    { type: 'string' },
    administrador_email:     { type: 'string', format: 'email' },
    administrador_telefono:  { type: 'string' },
    telefono_emergencia:     { type: 'string' },
    email_contacto:          { type: 'string', format: 'email' },
    logo_url:                { type: 'string', format: 'uri' },
  },
} as const;

const updateBodyShape = {
  type: 'object',
  properties: {
    nombre:                  { type: 'string', minLength: 2, maxLength: 200 },
    direccion:               { type: 'string', minLength: 5, maxLength: 300 },
    ciudad:                  { type: 'string' },
    departamento:            { type: 'string' },
    pais:                    { type: 'string' },
    codigo_catastral:        { type: 'string' },
    tipo_conjunto:           { type: 'string', enum: TIPO_ENUM },
    numero_torres:           { type: 'integer', minimum: 1 },
    numero_unidades:         { type: 'integer', minimum: 1 },
    anio_construccion:       { type: 'integer', minimum: 1800 },
    area_total_m2:           { type: 'number', minimum: 0 },
    area_comun_m2:           { type: 'number', minimum: 0 },
    administrador_nombre:    { type: 'string' },
    administrador_email:     { type: 'string', format: 'email' },
    administrador_telefono:  { type: 'string' },
    telefono_emergencia:     { type: 'string' },
    email_contacto:          { type: 'string', format: 'email' },
    logo_url:                { type: 'string', format: 'uri' },
    activo:                  { type: 'boolean' },
  },
} as const;

// ─── Route option objects ─────────────────────────────────────────────────────

const listOpts = {
  schema: {
    tags,
    summary: 'Listar conjuntos',
    security: [{ bearerAuth: [] }],
    querystring: {
      type: 'object',
      properties: {
        page:          { type: 'integer', minimum: 1, default: 1 },
        limit:         { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        search:        { type: 'string' },
        tipo_conjunto: { type: 'string', enum: TIPO_ENUM },
        activo:        { type: 'string', enum: ['true', 'false'] },
      },
    },
    response: { 200: paginatedShape },
  },
};

const getByIdOpts = {
  schema: {
    tags,
    summary: 'Obtener conjunto por ID',
    security: [{ bearerAuth: [] }],
    params: idParam,
    response: { 200: conjuntoShape, 404: errorShape },
  },
};

const createOpts = {
  schema: {
    tags,
    summary: 'Crear conjunto',
    security: [{ bearerAuth: [] }],
    body: createBodyShape,
    response: { 201: conjuntoShape, 409: errorShape, 422: validationErrorShape },
  },
};

const updateOpts = {
  schema: {
    tags,
    summary: 'Actualizar conjunto',
    security: [{ bearerAuth: [] }],
    params: idParam,
    body: updateBodyShape,
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
    summary: 'Desactivar conjunto (soft delete)',
    security: [{ bearerAuth: [] }],
    params: idParam,
    response: { 200: conjuntoShape, 404: errorShape },
  },
};

const deleteOpts = {
  schema: {
    tags,
    summary: 'Eliminar conjunto (hard delete)',
    security: [{ bearerAuth: [] }],
    params: idParam,
    response: { 204: { type: 'null' }, 404: errorShape },
  },
};

// ─── Guards ───────────────────────────────────────────────────────────────────

const authenticated = [authMiddleware];
const adminOnly     = [authMiddleware, permitRoles('administrador')];

// ─── Plugin ───────────────────────────────────────────────────────────────────

export default async function conjuntosRoutes(app: FastifyInstance) {
  app.get('/conjuntos',      { ...listOpts,    preHandler: authenticated }, listConjuntos);
  app.get('/conjuntos/:id',  { ...getByIdOpts, preHandler: authenticated }, getConjuntoById);

  app.post(  '/conjuntos',                   { ...createOpts,     preHandler: adminOnly }, createConjunto);
  app.patch( '/conjuntos/:id',               { ...updateOpts,     preHandler: adminOnly }, updateConjunto);
  app.patch( '/conjuntos/:id/desactivar',    { ...deactivateOpts, preHandler: adminOnly }, deactivateConjunto);
  app.delete('/conjuntos/:id',               { ...deleteOpts,     preHandler: adminOnly }, deleteConjunto);
}