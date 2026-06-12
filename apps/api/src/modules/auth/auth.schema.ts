import { z } from "zod";

// ─── Helpers ────────────────────────────────────────────────────────────────

const passwordRule = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(72, "La contraseña no puede superar 72 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
  .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
  .regex(/[0-9]/, "Debe contener al menos un número")
  .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial");

export const tipoUsuarioEnum = z.enum([
  "propietario",
  "inquilino",
  "administrador",
  "vigilante",
  "celadora",
  "aseadora",
  "otro",
]);

// ─── Request schemas ─────────────────────────────────────────────────────────

export const registerSchema = z.object({
  nombre: z
    .string({ required_error: "El nombre es obligatorio" })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120)
    .trim(),
  email: z
    .string({ required_error: "El email es obligatorio" })
    .email("Email inválido")
    .toLowerCase()
    .trim(),
  password: passwordRule,
  tenantId: z
    .string({ required_error: "tenantId es obligatorio" })
    .uuid("tenantId debe ser un UUID válido"),
  roleName: z.string().min(1).optional(),
  unidadId: z.string().uuid("unidadId debe ser un UUID válido").optional(),
  tipoUsuario: tipoUsuarioEnum.default("administrador"),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "El email es obligatorio" })
    .email("Email inválido")
    .toLowerCase()
    .trim(),
  password: z.string({ required_error: "La contraseña es obligatoria" }).min(1),
});

export const refreshSchema = z.object({
  refreshToken: z
    .string({ required_error: "refreshToken es obligatorio" })
    .min(1),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: "La contraseña actual es obligatoria" })
      .min(1),
    newPassword: passwordRule,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "La nueva contraseña debe ser diferente a la actual",
    path: ["newPassword"],
  });

// ─── Inferred types ──────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;