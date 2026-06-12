import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const tipoUsuarioEnum = z.enum([
  "propietario",
  "inquilino",
  "administrador",
  "vigilante",
  "celadora",
  "aseadora",
  "contador",
  "gerente",
  "otro",
]);

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const usuarioCreateSchema = z.object({
  nombre: z
    .string({ required_error: "El nombre es obligatorio" })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(200)
    .trim(),
  email: z
    .string({ required_error: "El email es obligatorio" })
    .email("Formato de email inválido")
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: "La contraseña es obligatoria" })
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(100),
  tenantId: z.string().uuid("tenantId debe ser un UUID válido").optional(),
  conjuntoId: z.string().uuid("conjuntoId debe ser un UUID válido").optional(),
  role: tipoUsuarioEnum.optional(),
  tipoUsuario: tipoUsuarioEnum.optional().default("propietario"),
  unidadId: z.string().uuid("unidadId debe ser un UUID válido").optional().nullable(),
  telefono: z.string().max(20).trim().optional(),
  documentoIdentificacion: z.string().max(50).trim().optional(),
  numeroDocumento: z.string().max(50).trim().optional(),
  urlFoto: z.string().url("URL de foto inválida").optional(),
});

export const usuarioUpdateSchema = z.object({
  nombre: z
    .string().min(2).max(200).trim().optional(),
  unidadId: z
    .string().uuid().nullable().optional(),
  conjuntoId: z
    .string().uuid().nullable().optional(),
  tipoUsuario: tipoUsuarioEnum.optional(),
  telefono: z.string().max(20).trim().optional(),
  documentoIdentificacion: z.string().max(50).trim().optional(),
  numeroDocumento: z.string().max(50).trim().optional(),
  urlFoto: z.string().url("URL inválida").optional(),
  activo: z.boolean().optional(),
});

export const usuarioQuerySchema = z.object({
  page:        z.coerce.number().int().min(1).default(1),
  limit:       z.coerce.number().int().min(1).max(100).default(20),
  tipoUsuario: tipoUsuarioEnum.optional(),
  conjuntoId:  z.string().uuid().optional(),
  unidadId:    z.string().uuid().optional(),
  activo:      z.coerce.boolean().optional(),
  bloqueado:   z.coerce.boolean().optional(),
  search:      z.string().max(100).trim().optional(), // buscar por nombre o email
});

export const usuarioParamsSchema = z.object({
  id: z.string().uuid("El id debe ser un UUID válido"),
});

export const usuarioBloqueoSchema = z.object({
  bloqueado:      z.boolean(),
  razon_bloqueo:  z.string().max(500).trim().optional(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type UsuarioCreateInput  = z.infer<typeof usuarioCreateSchema>;
export type UsuarioUpdateInput  = z.infer<typeof usuarioUpdateSchema>;
export type UsuarioQuery        = z.infer<typeof usuarioQuerySchema>;
export type UsuarioParams       = z.infer<typeof usuarioParamsSchema>;
export type UsuarioBloqueoInput = z.infer<typeof usuarioBloqueoSchema>;