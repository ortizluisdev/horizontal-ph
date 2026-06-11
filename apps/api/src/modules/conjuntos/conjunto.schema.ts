import { z } from "zod";

export const conjuntoSchema = z.object({
	tenantId: z.string().uuid().optional(),
	nombre: z.string().min(1),
	direccion: z.string().min(1),
	ciudad: z.string().optional(),
	tipo_conjunto: z.string().optional(),
});

export type ConjuntoInput = z.infer<typeof conjuntoSchema>;
