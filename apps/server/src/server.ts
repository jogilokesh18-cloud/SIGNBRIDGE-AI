import { app } from './app.js';
import { env } from './config/environment.js';
import { logger } from './config/logger.js';

const server = app.listen(env.PORT, () => {
  logger.info(`SIGNBRIDGE AI Server running on http://localhost:${env.PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
  logger.info(`API Base URL: ${env.API_BASE_URL}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Gracefully closing server...');
  server.close(() => {
    logger.info('Process terminated.');
  });
});
