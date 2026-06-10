import { z } from "zod";

export const unidadSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
});

export type UnidadInput = z.infer<typeof unidadSchema>;
