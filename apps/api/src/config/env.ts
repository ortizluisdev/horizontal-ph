import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().default("postgresql://postgres:password@localhost:5432/horizontal_ph"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  JWT_SECRET: z.string().default("secreto_desarrollo_minimo_32_caracteres_ok"),
  AI_PROVIDER: z.enum(["openai", "anthropic"]).default("openai"),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
export type Env = typeof env;