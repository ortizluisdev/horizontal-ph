import { pool } from "../../core/database/pg.client.js";
import type { NotificacionInput, Notificacion } from "@horizontal-ph/types";

export class NotificacionRepository {
	async list(): Promise<Notificacion[]> {
		const res = await pool.query(`SELECT id, tipo, asunto, estado, fecha_envio FROM notificaciones ORDER BY fecha_envio DESC LIMIT 100`);
		return res.rows;
	}

	async findById(id: string): Promise<Notificacion | null> {
		const res = await pool.query(`SELECT * FROM notificaciones WHERE id = $1 LIMIT 1`, [id]);
		return res.rows[0] ?? null;
	}

	async create(data: NotificacionInput): Promise<Notificacion | null> {
		const insert = await pool.query(
			`INSERT INTO notificaciones (conjunto_id, usuario_id, tipo, asunto, cuerpo, fecha_programada) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
			[data.conjuntoId ?? null, data.usuarioId ?? null, data.tipo ?? null, data.asunto ?? null, data.cuerpo ?? null, data.fecha_programada ?? null]
		);
		const id = insert.rows[0].id as string;
		return this.findById(id);
	}
}
