import { z } from 'zod'

export const tipoAsambleaEnum = z.enum([
  'ordinaria',
  'extraordinaria',
  'de_propietarios',
  'de_consejo',
  'otra',
])

export const estadoAsambleaEnum = z.enum([
  'programada',
  'en_curso',
  'realizada',
  'cancelada',
  'pospuesta',
])

export const resultadoVotacionEnum = z.enum(['aprobado', 'rechazado', 'aplazado'])

export const asambleaCreateSchema = z.object({
  conjuntoId:         z.string({ required_error: 'conjuntoId es obligatorio' }).uuid('conjuntoId debe ser un UUID válido'),
  numero_acta:        z.string({ required_error: 'El número de acta es obligatorio' }).min(1).max(50).trim(),
  tipo:               tipoAsambleaEnum,
  asunto:             z.string({ required_error: 'El asunto es obligatorio' }).min(5, 'Mínimo 5 caracteres').max(500).trim(),
  descripcion:        z.string().max(2000).trim().optional(),
  fecha_programada:   z.string({ required_error: 'La fecha programada es obligatoria' }).datetime(),
  lugar:              z.string().min(2).max(300).trim().optional(),
  presidente_nombre:  z.string().max(200).trim().optional(),
  secretario_nombre:  z.string().max(200).trim().optional(),
  quorum_requerido:   z.coerce.number().int().min(1).max(100).optional(),
  votacion_requerida: z.boolean().optional().default(false),
  observaciones:      z.string().max(1000).trim().optional(),
})

export const asambleaUpdateSchema = z.object({
  numero_acta:         z.string().min(1).max(50).trim().optional(),
  tipo:                tipoAsambleaEnum.optional(),
  asunto:              z.string().min(5).max(500).trim().optional(),
  descripcion:         z.string().max(2000).trim().optional(),
  fecha_programada:    z.string().datetime().optional(),
  fecha_realizada:     z.string().datetime().optional(),
  lugar:               z.string().min(2).max(300).trim().optional(),
  presidente_nombre:   z.string().max(200).trim().optional(),
  secretario_nombre:   z.string().max(200).trim().optional(),
  quorum_requerido:    z.coerce.number().int().min(1).max(100).optional(),
  asistentes_presente: z.coerce.number().int().min(0).optional(),
  asistentes_ausentes: z.coerce.number().int().min(0).optional(),
  representantes:      z.coerce.number().int().min(0).optional(),
  votacion_requerida:  z.boolean().optional(),
  estado:              estadoAsambleaEnum.optional(),
  documento_acta_url:  z.string().url().optional(),
  adjunto_url:         z.string().url().optional(),
  observaciones:       z.string().max(1000).trim().optional(),
})

export const asambleaParamsSchema = z.object({
  id: z.string().uuid('El id debe ser un UUID válido'),
})

export const asambleaQuerySchema = z.object({
  page:       z.coerce.number().int().min(1).default(1),
  limit:      z.coerce.number().int().min(1).max(100).default(20),
  conjuntoId: z.string().uuid().optional(),
  tipo:       tipoAsambleaEnum.optional(),
  estado:     estadoAsambleaEnum.optional(),
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional(),
})

// ─── Votaciones ───────────────────────────────────────────────────────────────

export const votacionCreateSchema = z.object({
  tema:            z.string({ required_error: 'El tema es obligatorio' }).min(3).max(300).trim(),
  descripcion:     z.string().max(1000).trim().optional(),
  votos_a_favor:   z.coerce.number().int().min(0).default(0),
  votos_en_contra: z.coerce.number().int().min(0).default(0),
  abstenciones:    z.coerce.number().int().min(0).default(0),
  resultado:       resultadoVotacionEnum.optional(),
  observaciones:   z.string().max(500).trim().optional(),
})

export const votacionUpdateSchema = z.object({
  tema:            z.string().min(3).max(300).trim().optional(),
  descripcion:     z.string().max(1000).trim().optional(),
  votos_a_favor:   z.coerce.number().int().min(0).optional(),
  votos_en_contra: z.coerce.number().int().min(0).optional(),
  abstenciones:    z.coerce.number().int().min(0).optional(),
  resultado:       resultadoVotacionEnum.optional(),
  observaciones:   z.string().max(500).trim().optional(),
})

export const votacionParamsSchema = z.object({
  id:  z.string().uuid(),
  vid: z.string().uuid(),
})

// ─── Acuerdos ─────────────────────────────────────────────────────────────────

export const acuerdoCreateSchema = z.object({
  descripcion:        z.string({ required_error: 'La descripción es obligatoria' }).min(5).max(1000).trim(),
  responsable_nombre: z.string().max(200).trim().optional(),
  fecha_vencimiento:  z.string().date().optional(),
  observaciones:      z.string().max(500).trim().optional(),
})

export const acuerdoUpdateSchema = z.object({
  descripcion:        z.string().min(5).max(1000).trim().optional(),
  responsable_nombre: z.string().max(200).trim().optional(),
  fecha_vencimiento:  z.string().date().optional(),
  estado:             z.enum(['pendiente', 'en progreso', 'cumplido', 'no cumplido']).optional(),
  observaciones:      z.string().max(500).trim().optional(),
})

export const acuerdoParamsSchema = z.object({
  id:  z.string().uuid(),
  aid: z.string().uuid(),
})

// ─── Types ────────────────────────────────────────────────────────────────────

export type AsambleaCreateInput = z.infer<typeof asambleaCreateSchema>
export type AsambleaUpdateInput = z.infer<typeof asambleaUpdateSchema>
export type AsambleaParams      = z.infer<typeof asambleaParamsSchema>
export type AsambleaQuery       = z.infer<typeof asambleaQuerySchema>
export type VotacionCreateInput = z.infer<typeof votacionCreateSchema>
export type VotacionUpdateInput = z.infer<typeof votacionUpdateSchema>
export type VotacionParams      = z.infer<typeof votacionParamsSchema>
export type AcuerdoCreateInput  = z.infer<typeof acuerdoCreateSchema>
export type AcuerdoUpdateInput  = z.infer<typeof acuerdoUpdateSchema>
export type AcuerdoParams       = z.infer<typeof acuerdoParamsSchema>
