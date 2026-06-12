import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const tipoAsambleaEnum = z.enum([
  "ordinaria",
  "extraordinaria",
  "de_propietarios",
  "de_consejo",
  "otra",
]);

export const estadoAsambleaEnum = z.enum([
  "programada",
  "en_curso",
  "realizada",
  "cancelada",
  "pospuesta",
]);

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const asambleaCreateSchema = z.object({
  conjuntoId: z
    .string({ required_error: "conjuntoId es obligatorio" })
    .uuid("conjuntoId debe ser un UUID válido"),
  numero_acta: z
    .string({ required_error: "El número de acta es obligatorio" })
    .min(1, "El número de acta no puede estar vacío")
    .max(50)
    .trim(),
  tipo: tipoAsambleaEnum,
  asunto: z
    .string({ required_error: "El asunto es obligatorio" })
    .min(5, "El asunto debe tener al menos 5 caracteres")
    .max(500)
    .trim(),
  fecha_programada: z
    .string({ required_error: "La fecha programada es obligatoria" })
    .datetime({ message: "La fecha programada debe ser un datetime ISO 8601 válido" }),
  lugar: z.string().min(2).max(300).trim().optional(),
  quorum_requerido: z.number().int().min(1).max(100).optional(),
  notas: z.string().max(1000).trim().optional(),
});

export const asambleaUpdateSchema = z.object({
  numero_acta:      z.string().min(1).max(50).trim().optional(),
  tipo:             tipoAsambleaEnum.optional(),
  asunto:           z.string().min(5).max(500).trim().optional(),
  fecha_programada: z.string().datetime({ message: "Formato datetime ISO 8601 inválido" }).optional(),
  lugar:            z.string().min(2).max(300).trim().optional(),
  quorum_requerido: z.number().int().min(1).max(100).optional(),
  notas:            z.string().max(1000).trim().optional(),
  estado:           estadoAsambleaEnum.optional(),
});

export const asambleaParamsSchema = z.object({
  id: z.string().uuid("El id debe ser un UUID válido"),
});

export const asambleaQuerySchema = z.object({
  page:       z.coerce.number().int().min(1).default(1),
  limit:      z.coerce.number().int().min(1).max(100).default(20),
  conjuntoId: z.string().uuid().optional(),
  tipo:       tipoAsambleaEnum.optional(),
  estado:     estadoAsambleaEnum.optional(),
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type AsambleaCreateInput = z.infer<typeof asambleaCreateSchema>;
export type AsambleaUpdateInput = z.infer<typeof asambleaUpdateSchema>;
export type AsambleaParams      = z.infer<typeof asambleaParamsSchema>;
export type AsambleaQuery       = z.infer<typeof asambleaQuerySchema>;