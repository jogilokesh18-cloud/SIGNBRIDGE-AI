import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load root .env or local .env
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config();

const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  API_BASE_URL: z.string().default('http://localhost:5000/api/v1'),

  // Supabase
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_ANON_KEY: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),
  SUPABASE_STORAGE_BUCKET: z.string().default('asl-media'),

  // Gemini API
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),

  // Model settings
  MODEL_VERSION: z.string().default('asl-static-v1'),
  MODEL_CONFIDENCE_THRESHOLD: z.coerce.number().default(0.60),
  MODEL_HIGH_CONFIDENCE_THRESHOLD: z.coerce.number().default(0.85),
  MODEL_COOLDOWN_MS: z.coerce.number().default(700),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(200),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info')
});

export type Environment = z.infer<typeof EnvironmentSchema>;

export const env = EnvironmentSchema.parse(process.env);
