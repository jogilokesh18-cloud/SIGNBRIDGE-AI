import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './environment.js';
import { logger } from './logger.js';

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
  try {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    if (env.SUPABASE_SERVICE_ROLE_KEY) {
      supabaseAdminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    }
    logger.info('Supabase client initialized successfully.');
  } catch (err) {
    logger.error({ err }, 'Failed to initialize Supabase client.');
  }
} else {
  logger.warn('Supabase URL or keys not provided. Running in Standalone/Local Mode.');
}

export { supabaseClient, supabaseAdminClient };
