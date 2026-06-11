import { pool } from "../../core/database/pg.client.js";
import type { PqrsInput, Pqrs } from "@horizontal-ph/types";

export class PqrsRepository {
	async list(): Promise<Pqrs[]> {
		const res = await pool.query(`SELECT id, tipo, asunto, estado, fecha_radicacion FROM pqrs ORDER BY fecha_radicacion DESC LIMIT 100`);
		return res.rows;
	}

	async findById(id: string): Promise<Pqrs | null> {
		const res = await pool.query(`SELECT * FROM pqrs WHERE id = $1 LIMIT 1`, [id]);
		return res.rows[0] ?? null;
	}

	async create(data: PqrsInput): Promise<Pqrs | null> {
		const insert = await pool.query(
			`INSERT INTO pqrs (conjunto_id, unidad_id, tipo, asunto, descripcion) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
			[data.conjuntoId, data.unidadId, data.tipo, data.asunto, data.descripcion ?? null]
		);
		const id = insert.rows[0].id as string;
		return this.findById(id);
	}
}
