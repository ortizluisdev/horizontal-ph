import { AuthRepository } from "./auth.repository";
import type { NewUserInput, User } from "@horizontal-ph/types";

const repo = new AuthRepository();

export class AuthService {
  async register(input: NewUserInput): Promise<User> {
    // podría añadir validaciones adicionales (email único ya lanzará error en BD)
    return repo.createUser(input);
  }

  async login(email: string, password: string): Promise<User | null> {
    return repo.verifyPassword(email, password);
  }

  async findById(id: string): Promise<User | null> {
    return repo.findUserById(id);
  }
}
