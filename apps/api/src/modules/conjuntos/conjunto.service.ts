import { ConjuntoRepository } from "./conjunto.repository.js";
import type { ConjuntoInput, Conjunto } from "@horizontal-ph/types";

const repo = new ConjuntoRepository();

export class ConjuntoService {
	async list(): Promise<Conjunto[]> {
		return repo.list();
	}

	async findById(id: string): Promise<Conjunto | null> {
		return repo.findById(id);
	}

	async create(data: ConjuntoInput): Promise<Conjunto | null> {
		return repo.create(data);
	}
}
