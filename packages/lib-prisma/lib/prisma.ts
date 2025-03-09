import { PrismaClient } from '@prisma/client';
import { logger } from 'lib-logger';

const createPrismaClient = () => {
  const prisma = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });

  prisma.$on('query', (e) => {
    logger.info(`Query: ${e.query}`);
    logger.info(`Params: ${e.params}`);
    logger.info(`Duration: ${e.duration}ms`);
  });

  prisma.$on('info', (e: { message: string }) => {
    logger.info(`Info: ${e.message}`);
  });

  prisma.$on('warn', (e: { message: string }) => {
    logger.warn(`Warn: ${e.message}`);
  });

  prisma.$on('error', (e: { message: string }) => {
    logger.error(e, `Error: ${e.message}`);
  });

  return prisma;
};

export const prisma = createPrismaClient();
