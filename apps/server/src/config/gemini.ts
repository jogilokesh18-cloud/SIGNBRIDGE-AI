import { GoogleGenAI } from '@google/genai';
import { env } from './environment.js';
import { logger } from './logger.js';

let geminiClient: GoogleGenAI | null = null;

if (env.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY
    });
    logger.info({ model: env.GEMINI_MODEL }, 'Google GenAI client initialized.');
  } catch (err) {
    logger.error({ err }, 'Failed to initialize Google GenAI client.');
  }
} else {
  logger.warn('GEMINI_API_KEY not configured. AI assistant will operate in deterministic educational mode.');
}

export { geminiClient };
