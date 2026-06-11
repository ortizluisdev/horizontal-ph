import type { NewUserInput, User } from "@horizontal-ph/types";

export interface UsuarioRecord extends User {}

const usuarios: UsuarioRecord[] = [];

export class UsuarioRepository {
  async list(): Promise<UsuarioRecord[]> {
    return usuarios;
  }

  async findById(id: string): Promise<UsuarioRecord | undefined> {
    return usuarios.find((usuario) => usuario.id === id);
  }

  async create(data: NewUserInput): Promise<UsuarioRecord> {
    const record: UsuarioRecord = {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Date.now().toString(),
      nombre: data.nombre,
      email: data.email,
      role_id: undefined,
      role_name: data.roleName ?? null,
      unidad_id: data.unidadId ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    } as UsuarioRecord;
    usuarios.push(record);
    return record;
  }
}