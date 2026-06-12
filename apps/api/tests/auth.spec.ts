import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "../src/modules/auth/auth.schema.js";

describe("Auth — registerSchema", () => {
  it("parsea payload válido", () => {
    const result = registerSchema.parse({
      nombre:   "Luis Ortiz",
      email:    "luis@test.com",
      password: "password123",
    });
    expect(result.email).toBe("luis@test.com");
    expect(result.nombre).toBe("Luis Ortiz");
  });

  it("rechaza contraseña corta", () => {
    expect(() =>
      registerSchema.parse({ nombre: "A", email: "x@x.com", password: "short" })
    ).toThrow();
  });

  it("rechaza email inválido", () => {
    expect(() =>
      registerSchema.parse({ nombre: "A", email: "no-es-email", password: "password123" })
    ).toThrow();
  });

  it("rechaza nombre vacío", () => {
    expect(() =>
      registerSchema.parse({ nombre: "", email: "x@x.com", password: "password123" })
    ).toThrow();
  });
});

describe("Auth — loginSchema", () => {
  it("parsea credenciales válidas", () => {
    const result = loginSchema.parse({ email: "x@x.com", password: "cualquier" });
    expect(result.email).toBe("x@x.com");
  });

  it("rechaza email inválido", () => {
    expect(() =>
      loginSchema.parse({ email: "noEmail", password: "pass" })
    ).toThrow();
  });

  it("requiere email", () => {
    expect(() =>
      loginSchema.parse({ password: "pass" })
    ).toThrow();
  });
});