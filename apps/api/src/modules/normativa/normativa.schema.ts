import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const tipoNormativaEnum = z.enum([
  "reglamento_ph", "manual_convivencia", "acta_asamblea", "resolucion",
  "circular", "politica_interna", "contrato", "ley_decreto", "otro",
]);

export const estadoNormativaEnum = z.enum([
  "borrador", "en_revision", "vigente", "derogado", "archivado",
]);

export const alcanceNormativaEnum = z.enum([
  "todos_propietarios", "consejo_administracion", "administracion",
  "comite_convivencia", "interno",
]);

export const categoriaLegalEnum = z.enum([
  "ley_675_2001", "decreto_reglamentario", "codigo_civil", "nsr_10",
  "norma_tecnica", "reglamento_interno", "decision_asamblea", "otra",
]);

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const normativaCreateSchema = z.object({
  conjuntoId:           z.string({ required_error: "conjuntoId es obligatorio" }).uuid(),
  titulo:               z.string({ required_error: "El título es obligatorio" }).min(5, "Mínimo 5 caracteres").max(300).trim(),
  tipo:                 tipoNormativaEnum,
  categoria_legal:      categoriaLegalEnum.optional(),
  estado:               estadoNormativaEnum.optional().default("borrador"),
  alcance:              alcanceNormativaEnum.optional().default("todos_propietarios"),
  numero_documento:     z.string().max(100).trim().optional(),
  version:              z.string().max(50).trim().optional(),
  descripcion:          z.string().max(1000).trim().optional(),
  contenido:            z.string().trim().optional(),
  archivo_url:          z.string().url("URL inválida").optional(),
  archivo_nombre:       z.string().max(300).trim().optional(),
  archivo_tamano:       z.number().int().positive().optional(),
  fecha_emision:        z.string().date("Formato inválido YYYY-MM-DD").optional(),
  fecha_vigencia_desde: z.string().date("Formato inválido YYYY-MM-DD").optional(),
  fecha_vigencia_hasta: z.string().date("Formato inválido YYYY-MM-DD").optional(),
  asamblea_id:          z.string().uuid().optional(),
  aprobado_por:         z.string().max(300).trim().optional(),
  tags:                 z.array(z.string().max(50)).optional().default([]),
  activo:               z.boolean().optional().default(true),
});

export const normativaUpdateSchema = z.object({
  titulo:               z.string().min(5).max(300).trim().optional(),
  tipo:                 tipoNormativaEnum.optional(),
  categoria_legal:      categoriaLegalEnum.optional(),
  estado:               estadoNormativaEnum.optional(),
  alcance:              alcanceNormativaEnum.optional(),
  numero_documento:     z.string().max(100).trim().optional(),
  version:              z.string().max(50).trim().optional(),
  descripcion:          z.string().max(1000).trim().optional(),
  contenido:            z.string().trim().optional(),
  archivo_url:          z.string().url().optional(),
  archivo_nombre:       z.string().max(300).trim().optional(),
  archivo_tamano:       z.number().int().positive().optional(),
  fecha_emision:        z.string().date().optional(),
  fecha_vigencia_desde: z.string().date().optional(),
  fecha_vigencia_hasta: z.string().date().optional(),
  aprobado_por:         z.string().max(300).trim().optional(),
  tags:                 z.array(z.string().max(50)).optional(),
  activo:               z.boolean().optional(),
});

export const normativaParamsSchema = z.object({
  id: z.string().uuid("El id debe ser un UUID válido"),
});

export const normativaQuerySchema = z.object({
  page:            z.coerce.number().int().min(1).default(1),
  limit:           z.coerce.number().int().min(1).max(100).default(20),
  conjuntoId:      z.string().uuid().optional(),
  tipo:            tipoNormativaEnum.optional(),
  estado:          estadoNormativaEnum.optional(),
  categoria_legal: categoriaLegalEnum.optional(),
  alcance:         alcanceNormativaEnum.optional(),
  search:          z.string().max(200).trim().optional(),
  activo:          z.coerce.boolean().optional(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type NormativaCreateInput = z.infer<typeof normativaCreateSchema>;
export type NormativaUpdateInput = z.infer<typeof normativaUpdateSchema>;
export type NormativaParams      = z.infer<typeof normativaParamsSchema>;
export type NormativaQuery       = z.infer<typeof normativaQuerySchema>;
