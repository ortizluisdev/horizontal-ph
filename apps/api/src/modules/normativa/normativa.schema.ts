import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const tipoNormativaEnum = z.enum([
  "reglamento",
  "manual_convivencia",
  "acuerdo",
  "resolucion",
  "circular",
  "otro",
]);

export const estadoNormativaEnum = z.enum([
  "borrador",
  "vigente",
  "derogada",
  "archivada",
]);

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const normativaCreateSchema = z.object({
  conjuntoId: z
    .string({ required_error: "conjuntoId es obligatorio" })
    .uuid("conjuntoId debe ser un UUID válido"),
  titulo: z
    .string({ required_error: "El título es obligatorio" })
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(300)
    .trim(),
  tipo: tipoNormativaEnum,
  descripcion:    z.string().max(1000).trim().optional(),
  contenido:      z.string().trim().optional(),
  version:        z.string().max(50).trim().optional(),
  estado:         estadoNormativaEnum.optional().default("vigente"),
  fecha_vigencia: z.string().date("Formato de fecha inválido (YYYY-MM-DD)").optional(),
  documento_url:  z.string().url("URL de documento inválida").optional(),
  activo:         z.boolean().optional().default(true),
});

export const normativaUpdateSchema = z.object({
  titulo:         z.string().min(3).max(300).trim().optional(),
  tipo:           tipoNormativaEnum.optional(),
  descripcion:    z.string().max(1000).trim().optional(),
  contenido:      z.string().trim().optional(),
  version:        z.string().max(50).trim().optional(),
  estado:         estadoNormativaEnum.optional(),
  fecha_vigencia: z.string().date("Formato de fecha inválido (YYYY-MM-DD)").optional(),
  documento_url:  z.string().url("URL de documento inválida").optional(),
  activo:         z.boolean().optional(),
});

export const normativaParamsSchema = z.object({
  id: z.string().uuid("El id debe ser un UUID válido"),
});

export const normativaQuerySchema = z.object({
  page:       z.coerce.number().int().min(1).default(1),
  limit:      z.coerce.number().int().min(1).max(100).default(20),
  conjuntoId: z.string().uuid().optional(),
  tipo:       tipoNormativaEnum.optional(),
  estado:     estadoNormativaEnum.optional(),
  activo:     z.coerce.boolean().optional(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type NormativaCreateInput = z.infer<typeof normativaCreateSchema>;
export type NormativaUpdateInput = z.infer<typeof normativaUpdateSchema>;
export type NormativaParams      = z.infer<typeof normativaParamsSchema>;
export type NormativaQuery       = z.infer<typeof normativaQuerySchema>;