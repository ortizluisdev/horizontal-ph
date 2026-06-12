import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const tipoPqrsEnum = z.enum([
  "peticion",
  "queja",
  "reclamo",
  "sugerencia",
]);

export const estadoPqrsEnum = z.enum([
  "abierta",
  "en_proceso",
  "resuelta",
  "cerrada",
  "archivada",
]);

export const prioridadPqrsEnum = z.enum([
  "baja",
  "normal",
  "alta",
  "urgente",
]);

export const categoriaPqrsEnum = z.enum([
  "infraestructura",
  "servicios",
  "seguridad",
  "convivencia",
  "otro",
]);

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const pqrsCreateSchema = z.object({
  conjuntoId: z
    .string({ required_error: "conjuntoId es obligatorio" })
    .uuid("conjuntoId debe ser un UUID válido"),
  unidadId: z
    .string({ required_error: "unidadId es obligatorio" })
    .uuid("unidadId debe ser un UUID válido"),
  usuarioId: z.string().uuid().optional(),
  tipo:      tipoPqrsEnum,
  asunto: z
    .string({ required_error: "El asunto es obligatorio" })
    .min(5, "El asunto debe tener al menos 5 caracteres")
    .max(300)
    .trim(),
  descripcion: z
    .string({ required_error: "La descripción es obligatoria" })
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(2000)
    .trim(),
  categoria:             categoriaPqrsEnum.optional(),
  prioridad:             prioridadPqrsEnum.optional().default("normal"),
  nombre_solicitante:    z.string().max(200).trim().optional(),
  email_solicitante:     z.string().email("Email inválido").optional(),
  telefono_solicitante:  z.string().max(20).trim().optional(),
  ubicacion_afectada:    z.string().max(300).trim().optional(),
  evidencia_foto_url:    z.string().url("URL inválida").optional(),
  requiere_seguimiento:  z.boolean().optional().default(false),
  fecha_proximo_seguimiento: z.string().date("Formato de fecha inválido (YYYY-MM-DD)").optional(),
});

export const pqrsUpdateSchema = z.object({
  estado:                      estadoPqrsEnum.optional(),
  prioridad:                   prioridadPqrsEnum.optional(),
  categoria:                   categoriaPqrsEnum.optional(),
  responsable_asignado_id:     z.string().uuid().optional(),
  responsable_asignado_nombre: z.string().max(200).trim().optional(),
  respuesta_descripcion:       z.string().max(2000).trim().optional(),
  requiere_seguimiento:        z.boolean().optional(),
  fecha_proximo_seguimiento:   z.string().date().optional(),
  observaciones_internas:      z.string().max(1000).trim().optional(),
  calificacion_satisfaccion:   z.number().int().min(1).max(5).optional(),
  comentario_satisfaccion:     z.string().max(500).trim().optional(),
});

export const pqrsParamsSchema = z.object({
  id: z.string().uuid("El id debe ser un UUID válido"),
});

export const pqrsQuerySchema = z.object({
  page:           z.coerce.number().int().min(1).default(1),
  limit:          z.coerce.number().int().min(1).max(100).default(20),
  conjuntoId:     z.string().uuid().optional(),
  unidadId:       z.string().uuid().optional(),
  tipo:           tipoPqrsEnum.optional(),
  estado:         estadoPqrsEnum.optional(),
  prioridad:      prioridadPqrsEnum.optional(),
  categoria:      categoriaPqrsEnum.optional(),
  fechaDesde:     z.string().datetime().optional(),
  fechaHasta:     z.string().datetime().optional(),
  numeroRadicado: z.string().optional(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type PqrsCreateInput = z.infer<typeof pqrsCreateSchema>;
export type PqrsUpdateInput = z.infer<typeof pqrsUpdateSchema>;
export type PqrsParams      = z.infer<typeof pqrsParamsSchema>;
export type PqrsQuery       = z.infer<typeof pqrsQuerySchema>;