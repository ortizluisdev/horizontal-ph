import { UsuarioRepository } from "./usuarios.repository";
import type { UsuarioInput } from "./usuarios.schema";

const repository = new UsuarioRepository();

export class UsuarioService {
  async list() {
    return repository.list();
  }

  async findById(id: string) {
    return repository.findById(id);
  }

  async create(data: UsuarioInput) {
    return repository.create(data);
  }
}
