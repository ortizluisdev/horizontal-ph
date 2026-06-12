import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const tipoNotificacionEnum = z.enum([
  "pago",
  "mantenimiento",
  "asamblea",
  "seguridad",
  "informativo",
  "otro",
]);

export const estadoNotificacionEnum = z.enum([
  "pendiente",
  "enviada",
  "entregada",
  "leida",
  "fallida",
]);

export const canalEnvioEnum = z.enum([
  "email",
  "sms",
  "push",
  "whatsapp",
  "otro",
]);

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const notificacionCreateSchema = z.object({
  conjuntoId: z
    .string({ required_error: "conjuntoId es obligatorio" })
    .uuid("conjuntoId debe ser un UUID válido"),
  usuarioId: z
    .string().uuid("usuarioId debe ser un UUID válido").optional(),
  templateId: z
    .string().uuid("templateId debe ser un UUID válido").optional(),
  tipo:     tipoNotificacionEnum,
  titulo:   z
    .string({ required_error: "El título es obligatorio" })
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(300)
    .trim(),
  contenido: z
    .string({ required_error: "El contenido es obligatorio" })
    .min(5, "El contenido debe tener al menos 5 caracteres")
    .trim(),
  canal_envio:           canalEnvioEnum.optional(),
  fecha_programada:      z.string().datetime({ message: "Formato datetime ISO 8601 inválido" }).optional(),
  importante:            z.boolean().optional().default(false),
  urgente:               z.boolean().optional().default(false),
  requiere_confirmacion: z.boolean().optional().default(false),
  max_reintentos:        z.number().int().min(0).max(10).optional().default(3),
  destinatarios:         z.array(z.string()).optional(),
  datos_variables:       z.record(z.unknown()).optional(),
});

export const notificacionUpdateSchema = z.object({
  estado:           estadoNotificacionEnum.optional(),
  razon_fallo:      z.string().max(500).trim().optional(),
  confirmada:       z.boolean().optional(),
  fecha_lectura:    z.string().datetime().optional(),
  fecha_entrega:    z.string().datetime().optional(),
  importante:       z.boolean().optional(),
  urgente:          z.boolean().optional(),
});

export const notificacionParamsSchema = z.object({
  id: z.string().uuid("El id debe ser un UUID válido"),
});

export const notificacionQuerySchema = z.object({
  page:       z.coerce.number().int().min(1).default(1),
  limit:      z.coerce.number().int().min(1).max(100).default(20),
  conjuntoId: z.string().uuid().optional(),
  usuarioId:  z.string().uuid().optional(),
  tipo:       tipoNotificacionEnum.optional(),
  estado:     estadoNotificacionEnum.optional(),
  canal:      canalEnvioEnum.optional(),
  importante: z.coerce.boolean().optional(),
  urgente:    z.coerce.boolean().optional(),
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificacionCreateInput = z.infer<typeof notificacionCreateSchema>;
export type NotificacionUpdateInput = z.infer<typeof notificacionUpdateSchema>;
export type NotificacionParams      = z.infer<typeof notificacionParamsSchema>;
export type NotificacionQuery       = z.infer<typeof notificacionQuerySchema>;