import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "../src/modules/auth/auth.schema";

describe("Auth schema", () => {
  it("valid register payload", () => {
    const payload = { nombre: "Test", email: "t@example.com", password: "password123" };
    const parsed = registerSchema.parse(payload);
    expect(parsed.email).toBe("t@example.com");
  });

  it("invalid register short password", () => {
    expect(() => registerSchema.parse({ nombre: "A", email: "x@x.com", password: "short" })).toThrow();
  });

  it("valid login", () => {
    const p = loginSchema.parse({ email: "x@x.com", password: "p" });
    expect(p.email).toBe("x@x.com");
  });
});
