import type { FastifyInstance } from 'fastify'
import authMiddleware from '../../core/auth/auth.middleware.js'
import permitRoles from '../../core/auth/permissions.guard.js'
import {
  listAsambleas,
  getAsambleaById,
  createAsamblea,
  updateAsamblea,
  deactivateAsamblea,
  deleteAsamblea,
  listVotaciones,
  createVotacion,
  updateVotacion,
  deleteVotacion,
  listAcuerdos,
  createAcuerdo,
  updateAcuerdo,
  deleteAcuerdo,
} from './asamblea.controller.js'

const tags        = ['Asambleas']
const authenticated = [authMiddleware]
const adminOnly     = [authMiddleware, permitRoles('administrador')]

const errorShape = {
  type: 'object',
  properties: { message: { type: 'string' } },
} as const

const validationErrorShape = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    errors: {
      type: 'array',
      items: { type: 'object', properties: { field: { type: 'string' }, message: { type: 'string' } } },
    },
  },
} as const

const asambleaShape = {
  type: 'object',
  properties: {
    id:                  { type: 'string', format: 'uuid' },
    conjunto_id:         { type: 'string', format: 'uuid' },
    numero_acta:         { type: 'string' },
    tipo:                { type: 'string' },
    asunto:              { type: 'string' },
    descripcion:         { type: 'string', nullable: true },
    fecha_programada:    { type: 'string', format: 'date-time' },
    fecha_realizada:     { type: 'string', format: 'date-time', nullable: true },
    lugar:               { type: 'string', nullable: true },
    presidente_nombre:   { type: 'string', nullable: true },
    secretario_nombre:   { type: 'string', nullable: true },
    quorum_requerido:    { type: 'integer', nullable: true },
    asistentes_presente: { type: 'integer', nullable: true },
    asistentes_ausentes: { type: 'integer', nullable: true },
    representantes:      { type: 'integer', nullable: true },
    votacion_requerida:  { type: 'boolean' },
    estado:              { type: 'string' },
    documento_acta_url:  { type: 'string', nullable: true },
    adjunto_url:         { type: 'string', nullable: true },
    observaciones:       { type: 'string', nullable: true },
    activo:              { type: 'boolean' },
    created_at:          { type: 'string', format: 'date-time' },
    updated_at:          { type: 'string', format: 'date-time' },
  },
} as const

const paginatedShape = {
  type: 'object',
  properties: {
    data:  { type: 'array', items: asambleaShape },
    total: { type: 'number' },
    page:  { type: 'number' },
    limit: { type: 'number' },
    pages: { type: 'number' },
  },
} as const

const idParam = {
  type: 'object',
  properties: { id: { type: 'string', format: 'uuid' } },
} as const

const votacionShape = {
  type: 'object',
  properties: {
    id:              { type: 'string', format: 'uuid' },
    asamblea_id:     { type: 'string', format: 'uuid' },
    numero_votacion: { type: 'integer' },
    tema:            { type: 'string' },
    descripcion:     { type: 'string', nullable: true },
    votos_a_favor:   { type: 'integer' },
    votos_en_contra: { type: 'integer' },
    abstenciones:    { type: 'integer' },
    resultado:       { type: 'string', nullable: true },
    observaciones:   { type: 'string', nullable: true },
    created_at:      { type: 'string', format: 'date-time' },
  },
} as const

const acuerdoShape = {
  type: 'object',
  properties: {
    id:                 { type: 'string', format: 'uuid' },
    asamblea_id:        { type: 'string', format: 'uuid' },
    numero_acuerdo:     { type: 'integer' },
    descripcion:        { type: 'string' },
    responsable_nombre: { type: 'string', nullable: true },
    fecha_vencimiento:  { type: 'string', nullable: true },
    estado:             { type: 'string' },
    observaciones:      { type: 'string', nullable: true },
    created_at:         { type: 'string', format: 'date-time' },
    updated_at:         { type: 'string', format: 'date-time' },
  },
} as const

export default async function asambleasRoutes(app: FastifyInstance) {
  // ── Asambleas ────────────────────────────────────────────────────────────────

  app.get('/asambleas', {
    schema: { tags, summary: 'Listar asambleas', security: [{ bearerAuth: [] }], response: { 200: paginatedShape } },
    preHandler: authenticated,
  }, listAsambleas)

  app.get('/asambleas/:id', {
    schema: { tags, summary: 'Obtener asamblea por ID', security: [{ bearerAuth: [] }], params: idParam, response: { 200: asambleaShape, 404: errorShape } },
    preHandler: authenticated,
  }, getAsambleaById)

  app.post('/asambleas', {
    schema: {
      tags, summary: 'Crear asamblea', security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['conjuntoId', 'numero_acta', 'tipo', 'asunto', 'fecha_programada'],
        properties: {
          conjuntoId: { type: 'string', format: 'uuid' },
          numero_acta: { type: 'string' },
          tipo: { type: 'string' },
          asunto: { type: 'string' },
          descripcion: { type: 'string' },
          fecha_programada: { type: 'string', format: 'date-time' },
          lugar: { type: 'string' },
          presidente_nombre: { type: 'string' },
          secretario_nombre: { type: 'string' },
          quorum_requerido: { type: 'integer' },
          votacion_requerida: { type: 'boolean' },
          observaciones: { type: 'string' },
        },
      },
      response: { 201: asambleaShape, 400: errorShape, 409: errorShape, 422: validationErrorShape },
    },
    preHandler: adminOnly,
  }, createAsamblea)

  app.patch('/asambleas/:id', {
    schema: {
      tags, summary: 'Actualizar asamblea', security: [{ bearerAuth: [] }],
      params: idParam,
      body: {
        type: 'object',
        properties: {
          numero_acta: { type: 'string' },
          tipo: { type: 'string' },
          asunto: { type: 'string' },
          descripcion: { type: 'string' },
          fecha_programada: { type: 'string', format: 'date-time' },
          fecha_realizada: { type: 'string', format: 'date-time' },
          lugar: { type: 'string' },
          presidente_nombre: { type: 'string' },
          secretario_nombre: { type: 'string' },
          quorum_requerido: { type: 'integer' },
          asistentes_presente: { type: 'integer' },
          asistentes_ausentes: { type: 'integer' },
          representantes: { type: 'integer' },
          votacion_requerida: { type: 'boolean' },
          estado: { type: 'string' },
          documento_acta_url: { type: 'string' },
          adjunto_url: { type: 'string' },
          observaciones: { type: 'string' },
        },
      },
      response: { 200: asambleaShape, 400: errorShape, 404: errorShape, 409: errorShape, 422: validationErrorShape },
    },
    preHandler: adminOnly,
  }, updateAsamblea)

  app.patch('/asambleas/:id/desactivar', {
    schema: {
      tags, summary: 'Desactivar asamblea (soft delete)', security: [{ bearerAuth: [] }],
      params: idParam,
      response: { 204: { type: 'null' }, 404: errorShape },
    },
    preHandler: adminOnly,
  }, deactivateAsamblea)

  app.delete('/asambleas/:id', {
    schema: {
      tags, summary: 'Eliminar asamblea (solo programada o cancelada)', security: [{ bearerAuth: [] }],
      params: idParam,
      response: { 204: { type: 'null' }, 400: errorShape, 404: errorShape },
    },
    preHandler: adminOnly,
  }, deleteAsamblea)

  // ── Votaciones ────────────────────────────────────────────────────────────────

  app.get('/asambleas/:id/votaciones', {
    schema: { tags, summary: 'Listar votaciones de una asamblea', security: [{ bearerAuth: [] }], params: idParam, response: { 200: { type: 'array', items: votacionShape }, 404: errorShape } },
    preHandler: authenticated,
  }, listVotaciones)

  app.post('/asambleas/:id/votaciones', {
    schema: {
      tags, summary: 'Agregar punto de votación', security: [{ bearerAuth: [] }],
      params: idParam,
      body: {
        type: 'object',
        required: ['tema'],
        properties: {
          tema: { type: 'string' },
          descripcion: { type: 'string' },
          votos_a_favor: { type: 'integer' },
          votos_en_contra: { type: 'integer' },
          abstenciones: { type: 'integer' },
          resultado: { type: 'string' },
          observaciones: { type: 'string' },
        },
      },
      response: { 201: votacionShape, 400: errorShape, 404: errorShape, 422: validationErrorShape },
    },
    preHandler: adminOnly,
  }, createVotacion)

  app.patch('/asambleas/:id/votaciones/:vid', {
    schema: {
      tags, summary: 'Actualizar punto de votación', security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, vid: { type: 'string', format: 'uuid' } } },
      body: {
        type: 'object',
        properties: {
          tema: { type: 'string' },
          descripcion: { type: 'string' },
          votos_a_favor: { type: 'integer' },
          votos_en_contra: { type: 'integer' },
          abstenciones: { type: 'integer' },
          resultado: { type: 'string' },
          observaciones: { type: 'string' },
        },
      },
      response: { 200: votacionShape, 404: errorShape, 422: validationErrorShape },
    },
    preHandler: adminOnly,
  }, updateVotacion)

  app.delete('/asambleas/:id/votaciones/:vid', {
    schema: {
      tags, summary: 'Eliminar punto de votación', security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, vid: { type: 'string', format: 'uuid' } } },
      response: { 204: { type: 'null' }, 404: errorShape },
    },
    preHandler: adminOnly,
  }, deleteVotacion)

  // ── Acuerdos ──────────────────────────────────────────────────────────────────

  app.get('/asambleas/:id/acuerdos', {
    schema: { tags, summary: 'Listar acuerdos de una asamblea', security: [{ bearerAuth: [] }], params: idParam, response: { 200: { type: 'array', items: acuerdoShape }, 404: errorShape } },
    preHandler: authenticated,
  }, listAcuerdos)

  app.post('/asambleas/:id/acuerdos', {
    schema: {
      tags, summary: 'Agregar acuerdo', security: [{ bearerAuth: [] }],
      params: idParam,
      body: {
        type: 'object',
        required: ['descripcion'],
        properties: {
          descripcion: { type: 'string' },
          responsable_nombre: { type: 'string' },
          fecha_vencimiento: { type: 'string' },
          observaciones: { type: 'string' },
        },
      },
      response: { 201: acuerdoShape, 400: errorShape, 404: errorShape, 422: validationErrorShape },
    },
    preHandler: adminOnly,
  }, createAcuerdo)

  app.patch('/asambleas/:id/acuerdos/:aid', {
    schema: {
      tags, summary: 'Actualizar acuerdo', security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, aid: { type: 'string', format: 'uuid' } } },
      body: {
        type: 'object',
        properties: {
          descripcion: { type: 'string' },
          responsable_nombre: { type: 'string' },
          fecha_vencimiento: { type: 'string' },
          estado: { type: 'string' },
          observaciones: { type: 'string' },
        },
      },
      response: { 200: acuerdoShape, 404: errorShape, 422: validationErrorShape },
    },
    preHandler: adminOnly,
  }, updateAcuerdo)

  app.delete('/asambleas/:id/acuerdos/:aid', {
    schema: {
      tags, summary: 'Eliminar acuerdo', security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, aid: { type: 'string', format: 'uuid' } } },
      response: { 204: { type: 'null' }, 404: errorShape },
    },
    preHandler: adminOnly,
  }, deleteAcuerdo)
}
