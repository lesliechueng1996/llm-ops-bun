import { describeRoute } from 'hono-openapi';
import {
  errorResponseSchema,
  successEmptyResponseSchema,
  z,
  zValidator,
} from '../common';
import { resolver } from 'hono-openapi/zod';

const createApiToolReqSchema = z.object({
  name: z
    .string({ message: '工具名称应为字符串' })
    .max(30, { message: '工具名称应少于30个字符' })
    .openapi({ example: '谷歌搜索', description: 'Tool name' }),
  icon: z
    .string({ message: '工具图标应为字符串' })
    .url({ message: '工具图标应为 url' })
    .openapi({
      example: 'https://www.google.com/favicon.ico',
      description: 'Tool icon',
    }),
  openapiSchema: z.string({ message: 'openapiSchema 应为字符串' }).openapi({
    example:
      '{"description":"这是一个查询对应英文单词字典的工具","server":"https://dict.youdao.com","paths":{"/suggest":{"get":{"description":"根据传递的单词查询其字典信息","operationId":"YoudaoSuggest","parameters":[{"name":"q","in":"query","description":"要检索查询的单词，例如love/computer","required":true,"type":"string"},{"name":"doctype","in":"query","description":"返回的数据类型，支持json和xml两种格式，默认情况下json数据","required":false,"type":"string"}]}}}}',
    description: 'Openapi schema',
  }),
  headers: z
    .array(
      z.object({
        key: z.string({ message: 'header key 应为字符串' }),
        value: z.string({ message: 'header value 应为字符串' }),
      }),
    )
    .openapi({
      example: [{ key: 'Authorization', value: 'Bearer xxxxxxxxx' }],
      description: 'Tool headers',
    }),
});

export type CreateApiToolReq = z.infer<typeof createApiToolReqSchema>;

export const createApiToolValidator = zValidator(
  'json',
  createApiToolReqSchema,
);

export const createApiToolRoute = describeRoute({
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
