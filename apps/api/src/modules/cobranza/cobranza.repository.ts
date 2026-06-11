import { pool } from "../../core/database/pg.client.js";
import type { CobranzaInput, Cobranza } from "@horizontal-ph/types";

export class CobranzaRepository {
	async list(): Promise<Cobranza[]> {
		const res = await pool.query(`SELECT id, numero_recibo, concepto, valor_total, estado, fecha_vencimiento FROM cobranza ORDER BY fecha_vencimiento DESC LIMIT 100`);
		return res.rows;
	}

	async findById(id: string): Promise<Cobranza | null> {
		const res = await pool.query(`SELECT * FROM cobranza WHERE id = $1 LIMIT 1`, [id]);
		return res.rows[0] ?? null;
	}

	async create(data: CobranzaInput): Promise<Cobranza | null> {
		const insert = await pool.query(
			`INSERT INTO cobranza (unidad_id, conjunto_id, numero_recibo, concepto, valor_total, fecha_vencimiento) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
			[data.unidadId, data.conjuntoId, data.numero_recibo, data.concepto, data.valor_total, data.fecha_vencimiento]
		);
		const id = insert.rows[0].id as string;
		return this.findById(id);
	}
}
