import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const tipoConjuntoEnum = z.enum([
  "residencial",
  "comercial",
  "mixto",
  "industrial",
  "otro",
]);

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const conjuntoCreateSchema = z.object({
  tenantId: z
    .string({ required_error: "tenantId es obligatorio" })
    .uuid("tenantId debe ser un UUID válido"),
  nombre: z
    .string({ required_error: "El nombre es obligatorio" })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(200)
    .trim(),
  direccion: z
    .string({ required_error: "La dirección es obligatoria" })
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(300)
    .trim(),
  ciudad: z.string().min(2).max(100).trim().optional(),
  tipo_conjunto: tipoConjuntoEnum.optional(),
});

export const conjuntoUpdateSchema = z.object({
  nombre:        z.string().min(2).max(200).trim().optional(),
  direccion:     z.string().min(5).max(300).trim().optional(),
  ciudad:        z.string().min(2).max(100).trim().optional(),
  tipo_conjunto: tipoConjuntoEnum.optional(),
  activo:        z.boolean().optional(),
});

export const conjuntoParamsSchema = z.object({
  id: z.string().uuid("El id debe ser un UUID válido"),
});

export const conjuntoQuerySchema = z.object({
  page:          z.coerce.number().int().min(1).default(1),
  limit:         z.coerce.number().int().min(1).max(100).default(20),
  search:        z.string().trim().optional(),
  tipo_conjunto: tipoConjuntoEnum.optional(),
  activo:        z.enum(["true", "false"]).transform((v) => v === "true").optional(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConjuntoCreateInput = z.infer<typeof conjuntoCreateSchema>;
export type ConjuntoUpdateInput = z.infer<typeof conjuntoUpdateSchema>;
export type ConjuntoParams      = z.infer<typeof conjuntoParamsSchema>;
export type ConjuntoQuery       = z.infer<typeof conjuntoQuerySchema>;