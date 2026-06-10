import type { UsuarioInput } from "./usuarios.schema";

interface UsuarioRecord extends UsuarioInput {
  id: string;
}

const usuarios: UsuarioRecord[] = [];

export class UsuarioRepository {
  async list() {
    return usuarios;
  }

  async findById(id: string) {
    return usuarios.find((usuario) => usuario.id === id);
  }

  async create(data: UsuarioInput) {
    const record: UsuarioRecord = {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Date.now().toString(),
      ...data,
    };

    usuarios.push(record);
    return record;
  }
}
