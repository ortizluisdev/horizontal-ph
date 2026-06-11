import { z } from "zod";

export const usuarioSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum([
    "propietario",
    "inquilino",
    "administrador",
    "vigilante",
    "celadora",
    "aseadora",
  ]),
  unidadId: z.string().optional(),
});

export type UsuarioInput = z.infer<typeof usuarioSchema>;
