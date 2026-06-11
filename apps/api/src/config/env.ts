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

export function isProduction() {
  return env.NODE_ENV === "production";
}

export function getPort() {
  return env.PORT;
}

export function getDatabaseUrl() {
  return env.DATABASE_URL;
}

export function getRedisUrl() {
  return env.REDIS_URL;
}

export function getJwtSecret() {
  return env.JWT_SECRET;
}

export function getAiProvider() {
  return env.AI_PROVIDER;
}

export function getOpenAIKey() {
  return env.OPENAI_API_KEY;
}

export function getAnthropicKey() {
  return env.ANTHROPIC_API_KEY;
}

export function isAiKeyConfigured() {
  return Boolean(env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY);
}

export function ensureAiKeyForProvider(provider: Env["AI_PROVIDER"] = env.AI_PROVIDER) {
  if (provider === "openai" && !env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required when AI_PROVIDER=openai");
  }

  if (provider === "anthropic" && !env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is required when AI_PROVIDER=anthropic");
  }

  return provider;
}
