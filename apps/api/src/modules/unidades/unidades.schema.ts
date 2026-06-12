import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const tipoUnidadEnum = z.enum([
  "apartamento",
  "casa",
  "local_comercial",
  "oficina",
  "bodega",
  "parqueadero",
  "otro",
]);

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const unidadCreateSchema = z.object({
  conjuntoId: z
    .string({ required_error: "conjuntoId es obligatorio" })
    .uuid("conjuntoId debe ser un UUID válido"),
  nombre: z
    .string({ required_error: "El nombre es obligatorio" })
    .min(1, "El nombre es obligatorio")
    .max(200)
    .trim(),
  descripcion:   z.string().max(500).trim().optional(),
  tipo_unidad:   tipoUnidadEnum.optional(),
  numero_unidad: z.string().max(20).trim().optional(),
  piso:          z.number().int().min(-5).max(200).optional(),
  area_m2:       z.number().positive("El área debe ser mayor a 0").max(99999).optional(),
});

export const unidadUpdateSchema = z.object({
  nombre:        z.string().min(1).max(200).trim().optional(),
  descripcion:   z.string().max(500).trim().optional(),
  tipo_unidad:   tipoUnidadEnum.optional(),
  numero_unidad: z.string().max(20).trim().optional(),
  piso:          z.number().int().min(-5).max(200).optional(),
  area_m2:       z.number().positive().max(99999).optional(),
  activo:        z.boolean().optional(),
});

export const unidadParamsSchema = z.object({
  id: z.string().uuid("El id debe ser un UUID válido"),
});

export const unidadQuerySchema = z.object({
  page:        z.coerce.number().int().min(1).default(1),
  limit:       z.coerce.number().int().min(1).max(100).default(20),
  search:      z.string().trim().optional(),
  conjuntoId:  z.string().uuid().optional(),
  tipo_unidad: tipoUnidadEnum.optional(),
  activo:      z.enum(["true", "false"]).transform((v) => v === "true").optional(),
  piso:        z.coerce.number().int().optional(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type UnidadCreateInput = z.infer<typeof unidadCreateSchema>;
export type UnidadUpdateInput = z.infer<typeof unidadUpdateSchema>;
export type UnidadParams      = z.infer<typeof unidadParamsSchema>;
export type UnidadQuery       = z.infer<typeof unidadQuerySchema>;