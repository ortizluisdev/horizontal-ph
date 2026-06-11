import { NotificacionRepository } from "./notificacion.repository.js";
import type { NotificacionInput, Notificacion } from "@horizontal-ph/types";

const repo = new NotificacionRepository();

export class NotificacionService {
	async list(): Promise<Notificacion[]> {
		return repo.list();
	}

	async findById(id: string): Promise<Notificacion | null> {
		return repo.findById(id);
	}

	async create(data: NotificacionInput): Promise<Notificacion | null> {
		return repo.create(data);
	}
}
