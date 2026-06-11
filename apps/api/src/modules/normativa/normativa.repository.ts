import { pool } from "../../core/database/pg.client.js";
import type { NormativaInput, Normativa } from "@horizontal-ph/types";

export class NormativaRepository {
	async list(): Promise<Normativa[]> {
		const res = await pool.query(`SELECT id, titulo, tipo, activo, created_at FROM normativa ORDER BY created_at DESC LIMIT 100`);
		return res.rows;
	}

	async findById(id: string): Promise<Normativa | null> {
		const res = await pool.query(`SELECT * FROM normativa WHERE id = $1 LIMIT 1`, [id]);
		return res.rows[0] ?? null;
	}

	async create(data: NormativaInput): Promise<Normativa | null> {
		const insert = await pool.query(
			`INSERT INTO normativa (conjunto_id, titulo, tipo, descripcion) VALUES ($1,$2,$3,$4) RETURNING id`,
			[data.conjuntoId ?? null, data.titulo ?? null, data.tipo ?? null, data.descripcion ?? null]
		);
		const id = insert.rows[0].id as string;
		return this.findById(id);
	}
}
