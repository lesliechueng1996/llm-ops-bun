import { describeRoute } from 'hono-openapi';
import {
  errorResponseSchema,
  successEmptyResponseSchema,
  z,
  zValidator,
} from '../common';
import { resolver } from 'hono-openapi/zod';

const updateApiToolProviderParamReqSchema = z.object({
  providerId: z
    .string()
    .openapi({ description: 'API工具提供商ID', example: 'xxxxxxxx' }),
});

const updateApiToolProviderBodyReqSchema = z.object({
  name: z
    .string({ message: 'Api 工具提供商名称应为字符串' })
    .openapi({ description: 'Api tool provider name', example: '谷歌搜索' }),
  icon: z
    .string({ message: 'Api 工具提供商图标应为字符串' })
    .url({ message: 'Api 工具提供商图标应为 url 格式字符串' })
    .openapi({
      description: 'Api tool provider icon',
      example: 'https://www.google.com/favicon.ico',
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

export type UpdateApiToolProviderBodyReq = z.infer<
  typeof updateApiToolProviderBodyReqSchema
>;

export const updateApiToolProviderParamReqValidator = zValidator(
  'param',
  updateApiToolProviderParamReqSchema,
);

export const updateApiToolProviderBodyReqValidator = zValidator(
  'json',
  updateApiToolProviderBodyReqSchema,
);

export const updateApiToolProviderRoute = describeRoute({
  tags: ['api-tools'],
  description: 'Update api tool provider',
  responses: {
    200: {
      description: 'Successful update api tool provider',
      content: {
        'application/json': {
          schema: resolver(successEmptyResponseSchema),
        },
      },
    },
    400: {
      description: 'Failed to validate the request body',
      content: {
        'application/json': {
          schema: resolver(errorResponseSchema),
        },
      },
    },
    404: {
      description: 'Api tool provider not found',
      content: {
        'application/json': {
          schema: resolver(errorResponseSchema),
        },
      },
    },
  },
});
