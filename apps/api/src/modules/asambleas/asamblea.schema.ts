import { z } from "zod";

export const asambleaSchema = z.object({
	conjuntoId: z.string().uuid(),
	numero_acta: z.string().min(1),
	tipo: z.string().min(1),
	asunto: z.string().min(1),
	fecha_programada: z.string(),
});

export type AsambleaInput = z.infer<typeof asambleaSchema>;
