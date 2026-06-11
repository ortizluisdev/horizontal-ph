import { NormativaRepository } from "./normativa.repository.js";
import type { NormativaInput, Normativa } from "@horizontal-ph/types";

const repo = new NormativaRepository();

export class NormativaService {
	async list(): Promise<Normativa[]> {
		return repo.list();
	}

	async findById(id: string): Promise<Normativa | null> {
		return repo.findById(id);
	}

	async create(data: NormativaInput): Promise<Normativa | null> {
		return repo.create(data);
	}
}
