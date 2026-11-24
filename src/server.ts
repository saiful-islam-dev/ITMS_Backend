import { createApp } from './app';
import { env } from './config/env.config';
import { prisma } from './database/prisma.client';

async function bootstrap() {
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`
  ======================================================
  🚀 Apex Garments ITMS Enterprise Backend
  📡 Environment : ${env.NODE_ENV}
  🌐 Server URL  : http://localhost:${env.PORT}${env.API_PREFIX}
  🩺 Health API  : http://localhost:${env.PORT}${env.API_PREFIX}/health
  📚 Swagger UI  : http://localhost:${env.PORT}/api/docs
  ======================================================
    `);
  });

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

    server.close(async () => {
      console.log('HTTP server closed.');
      await prisma.$disconnect();
      console.log('Database connections closed.');
      process.exit(0);
    });

    // Force close if graceful shutdown exceeds 10 seconds
    setTimeout(() => {
      console.error('Forcefully terminating process after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});
