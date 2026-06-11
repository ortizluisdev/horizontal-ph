import { z } from "zod";

export const registerSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  tenantId: z.string().uuid(),
  unidadId: z.string().uuid().optional(),
  roleName: z.string().optional(),
  tipoUsuario: z.enum([
    'propietario', 'inquilino', 'administrador',
    'vigilante', 'celadora', 'aseadora', 'otro'
  ]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;