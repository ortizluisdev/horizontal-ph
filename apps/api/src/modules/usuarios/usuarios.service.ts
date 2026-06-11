import { UsuarioRepository, type UsuarioRecord } from "./usuarios.repository.js";
import type { NewUserInput, User } from "@horizontal-ph/types";

const repository = new UsuarioRepository();

export class UsuarioService {
  async list(): Promise<UsuarioRecord[]> {
    return repository.list();
  }

  async findById(id: string): Promise<UsuarioRecord | undefined> {
    return repository.findById(id);
  }

  async create(data: NewUserInput): Promise<UsuarioRecord> {
    return repository.create(data);
  }
}