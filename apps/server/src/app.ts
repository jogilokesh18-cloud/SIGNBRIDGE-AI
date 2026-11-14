import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { env } from './config/environment.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports for AURA AI
import { catalogRouter } from './routes/catalog.routes.js';
import { stylistRouter } from './routes/stylist.routes.js';
import { commerceRouter } from './routes/commerce.routes.js';
import { merchantRouter } from './routes/merchant.routes.js';

export const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-user-id']
}));

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please slow down and try again shortly.'
    }
  }
});
app.use('/api', limiter);

// Request body parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Structured HTTP Logging
app.use(pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === '/api/health'
  }
}));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'operational',
      service: 'AURA AI — Spatial Commerce & Generative Luxury Styling Engine',
      version: '2.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

// AURA AI API Routes v1
app.use('/api/v1/catalog', catalogRouter);
app.use('/api/v1/stylist', stylistRouter);
app.use('/api/v1/commerce', commerceRouter);
app.use('/api/v1/merchant', merchantRouter);

// 404 Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} does not exist.`
    }
  });
});

// Global Error Handler
app.use(errorHandler);
