import { logger } from 'lib-logger';

export const pinoLogger = (message: string, ...rest: string[]) => {
  logger.info(message, ...rest);
};
