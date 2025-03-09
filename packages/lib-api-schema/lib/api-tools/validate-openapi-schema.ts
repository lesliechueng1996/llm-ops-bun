import { describeRoute } from 'hono-openapi';
import {
  errorResponseSchema,
  successEmptyResponseSchema,
  z,
  zValidator,
} from '../common';
import { resolver } from 'hono-openapi/zod';

const OPENAPI_EXAMPLE =
  '{"description":"这是一个查询对应英文单词字典的工具","server":"https://dict.youdao.com","paths":{"/suggest":{"get":{"description":"根据传递的单词查询其字典信息","operationId":"YoudaoSuggest","parameters":[{"name":"q","in":"query","description":"要检索查询的单词，例如love/computer","required":true,"type":"string"},{"name":"doctype","in":"query","description":"返回的数据类型，支持json和xml两种格式，默认情况下json数据","required":false,"type":"string"}]}}}}';

const validateOpenapiReqSchema = z.object(
  {
    openapiSchema: z
      .string({ message: 'openapiSchema 为必填字符串' })
      .openapi({ example: OPENAPI_EXAMPLE, description: 'openapi schema' }),
  },
  { message: 'openapiSchema 应为 json 字符串' },
);

export const validateOpenapiValidator = zValidator(
  'json',
  validateOpenapiReqSchema,
);

export type ValidateOpenapiReq = z.infer<typeof validateOpenapiReqSchema>;

export const validateOpenapiRoute = describeRoute({
  tags: ['api-tools'],
  description: 'Validate the openapi schema',
  responses: {
    200: {
      description: 'Successful validate the openapi schema',
      content: {
        'application/json': {
          schema: resolver(successEmptyResponseSchema),
        },
      },
    },
    400: {
      description: 'Failed to validate the openapi schema',
      content: {
        'application/json': {
          schema: resolver(errorResponseSchema),
        },
      },
    },
  },
});
