import { getAccountId } from '@/lib/context';
import {
  createApiTool,
  deleteApiToolProvider,
  getApiToolInfo,
  getApiToolProviderInfo,
  getApiToolsPagination,
  updateApiToolProviderAndTools,
  validateOpenapiSchema,
} from 'lib-api-tool';
import { Hono } from 'hono';
import { BadRequestApiError, ok, okMessage, okPaginator } from 'lib-api-schema';
import {
  createApiToolRoute,
  createApiToolValidator,
  deleteApiToolProviderRoute,
  deleteApiToolProviderValidator,
  getApiToolProviderRoute,
  getApiToolProviderValidator,
  getApiToolRoute,
  getApiToolValidator,
  getApiToolsRoute,
  getApiToolsValidator,
  updateApiToolProviderBodyReqValidator,
  updateApiToolProviderParamReqValidator,
  updateApiToolProviderRoute,
  validateOpenapiRoute,
  validateOpenapiValidator,
} from 'lib-api-schema/lib/api-tools';

const apiTool = new Hono();

apiTool.post(
  '/validate-openapi-schema',
  validateOpenapiRoute,
  validateOpenapiValidator,
  async (c) => {
    const { openapiSchema } = c.req.valid('json');
    validateOpenapiSchema(openapiSchema);
    return c.json(okMessage('openapi schema 校验通过'));
  },
);

apiTool.post('/', createApiToolRoute, createApiToolValidator, async (c) => {
  const accountId = getAccountId();
  await createApiTool(c.req.valid('json'), accountId);
  return c.json(okMessage('API工具创建成功'));
});

apiTool.get('/', getApiToolsRoute, getApiToolsValidator, async (c) => {
  const accountId = getAccountId();
  const req = c.req.valid('query');
  const result = await getApiToolsPagination(req, accountId);
  return c.json(okPaginator(req, result));
});

apiTool.delete(
  '/:providerId',
  deleteApiToolProviderRoute,
  deleteApiToolProviderValidator,
  async (c) => {
    const accountId = getAccountId();
    const { providerId } = c.req.valid('param');
    await deleteApiToolProvider(providerId, accountId);
    return c.json(okMessage('API工具删除成功'));
  },
);

apiTool.get(
  '/:providerId',
  getApiToolProviderRoute,
  getApiToolProviderValidator,
  async (c) => {
    const accountId = getAccountId();
    const { providerId } = c.req.valid('param');
    const result = await getApiToolProviderInfo(providerId, accountId);
    return c.json(ok(result));
  },
);

apiTool.get(
  '/:providerId/tools/:operationId',
  getApiToolRoute,
  getApiToolValidator,
  async (c) => {
    const accountId = getAccountId();
    const { providerId, operationId } = c.req.valid('param');
    const result = await getApiToolInfo(providerId, operationId, accountId);
    return c.json(ok(result));
  },
);

apiTool.put(
  '/:providerId',
  updateApiToolProviderRoute,
  updateApiToolProviderParamReqValidator,
  updateApiToolProviderBodyReqValidator,
  async (c) => {
    const accountId = getAccountId();
    const { providerId } = c.req.valid('param');
    const body = c.req.valid('json');

    await updateApiToolProviderAndTools(providerId, accountId, body);
    return c.json(okMessage('API工具更新成功'));
  },
);

export { apiTool };
