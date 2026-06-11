import { PqrsRepository } from "./pqrs.repository.js";
import type { PqrsInput, Pqrs } from "@horizontal-ph/types";

const repo = new PqrsRepository();

export class PqrsService {
	async list(): Promise<Pqrs[]> {
		return repo.list();
	}

	async findById(id: string): Promise<Pqrs | null> {
		return repo.findById(id);
	}

	async create(data: PqrsInput): Promise<Pqrs | null> {
		return repo.create(data);
	}
}
