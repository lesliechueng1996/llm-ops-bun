import {
  getAllBuiltinTools,
  getBuiltinToolCategories,
  getSpecificTool,
} from 'lib-builtin-tool';
import { Hono } from 'hono';
import { NotFoundApiError, ok } from 'lib-api-schema';
import {
  getBuiltinToolsRoute,
  getCategoriesRoute,
  getSpecificBuiltinToolRoute,
  getSpecificBuiltinToolValidator,
} from 'lib-api-schema/lib/builtin-tools';

const builtinTool = new Hono();

builtinTool.get('/categories', getCategoriesRoute, async (c) => {
  return c.json(ok(getBuiltinToolCategories()));
});

builtinTool.get('/', getBuiltinToolsRoute, async (c) => {
  return c.json(ok(getAllBuiltinTools()));
});

builtinTool.get(
  '/:provider/tools/:tool',
  getSpecificBuiltinToolRoute,
  getSpecificBuiltinToolValidator,
  async (c) => {
    const { provider: providerName, tool: toolName } = c.req.valid('param');
    const tool = getSpecificTool(providerName, toolName);
    if (tool === null) {
      throw new NotFoundApiError('指定的工具不存在');
    }
    return c.json(ok(tool));
  },
);
export { builtinTool };
