import { swaggerUI } from '@hono/swagger-ui';
import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import {
  ApiError,
  UnauthorizedApiError,
  internalServerError,
  openAPISpecs,
} from 'lib-api-schema';
import { logger as log } from 'lib-logger';
import { apiTool } from './apis/api-tool';
import { builtinTool } from './apis/builtin-tool';
import type { Context } from './lib/context';
import { pinoLogger } from './lib/logger';

const ACCOUNT_ID_HEADER = 'X-Account-Id';

const app = new Hono();
app.use(logger(pinoLogger));

const api = new Hono<Context>();
api.use(contextStorage());
api.use(async (c, next) => {
  const accountId = c.req.header(ACCOUNT_ID_HEADER);
  if (!accountId) {
    return c.json(new UnauthorizedApiError('缺少accountId').toResponse(), 401);
  }

  c.set('accountId', accountId);
  await next();
});

api.route('/builtin-tools', builtinTool);
api.route('/api-tools', apiTool);

app.route('/api', api);
app.get(
  '/openapi',
  openAPISpecs(app, {
    documentation: {
      info: {
        title: 'LLM Ops API',
        version: '1.0.0',
        description: 'API for LLM Ops',
      },
      components: {
        securitySchemes: {
          [ACCOUNT_ID_HEADER]: {
            type: 'apiKey',
            name: ACCOUNT_ID_HEADER,
            in: 'header',
          },
        },
      },
      security: [
        {
          [ACCOUNT_ID_HEADER]: [],
        },
      ],
      servers: [
        {
          url: 'http://localhost:8000',
          description: 'Local development server',
        },
      ],
    },
  }),
);
app.get(
  '/swagger',
  swaggerUI({
    url: '/openapi',
  }),
);

app.onError((err, c) => {
  log.error(err);
  if (err instanceof ApiError) {
    return c.json(err.toResponse(), err.statusCode() as ContentfulStatusCode);
  }

  if (err instanceof HTTPException) {
    return c.json(
      {
        code: `${err.status}`,
        message: err.message,
        data: null,
      },
      err.status,
    );
  }

  return c.json(internalServerError('系统异常'), 500);
});

export default {
  port: 8000,
  fetch: app.fetch,
};
