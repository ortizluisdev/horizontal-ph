import { z } from "zod";

export const pqrsSchema = z.object({
	conjuntoId: z.string().uuid(),
	unidadId: z.string().uuid(),
	tipo: z.string().min(1),
	asunto: z.string().min(1),
	descripcion: z.string().optional(),
});

export type PqrsInput = z.infer<typeof pqrsSchema>;
