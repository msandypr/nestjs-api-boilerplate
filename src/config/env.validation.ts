// Environment variable validation using Zod.
// Parses and validates all required env vars at startup.
// The app will crash immediately if any variable is missing or invalid.

import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRATION: z.string().default("1d"),
});

export const env = envSchema.parse(process.env);
