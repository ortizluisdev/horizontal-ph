import { CobranzaRepository } from "./cobranza.repository.js";
import type { CobranzaInput, Cobranza } from "@horizontal-ph/types";

const repo = new CobranzaRepository();

export class CobranzaService {
	async list(): Promise<Cobranza[]> {
		return repo.list();
	}

	async findById(id: string): Promise<Cobranza | null> {
		return repo.findById(id);
	}

	async create(data: CobranzaInput): Promise<Cobranza | null> {
		return repo.create(data);
	}
}
