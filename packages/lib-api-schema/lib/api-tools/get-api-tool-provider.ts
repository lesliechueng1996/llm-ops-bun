import { describeRoute } from 'hono-openapi';
import {
  errorResponseSchema,
  wrapResponseSchema,
  z,
  zValidator,
} from '../common';
import { resolver } from 'hono-openapi/zod';

const getApiToolProviderReqSchema = z.object({
  providerId: z
    .string()
    .openapi({ description: 'Api tool provider id', example: 'xxxxxxxx' }),
});

export type GetApiToolProviderReq = z.infer<typeof getApiToolProviderReqSchema>;

export const getApiToolProviderValidator = zValidator(
  'param',
  getApiToolProviderReqSchema,
);

const getApiToolProviderResSchema = wrapResponseSchema(
  z.object({
    id: z
      .string()
      .openapi({ example: 'xxxxxxxxx', description: 'Api tool provider id' }),
    name: z
      .string()
      .openapi({ example: '谷歌搜索', description: 'Api tool provider name' }),
    icon: z.string().openapi({
      example: 'https://www.google.com/favicon.ico',
      description: 'Api tool provider icon',
    }),
    openapiSchema: z.string().openapi({
      example:
        '{"description":"这是一个查询对应英文单词字典的工具","server":"https://dict.youdao.com","paths":{"/suggest":{"get":{"description":"根据传递的单词查询其字典信息","operationId":"YoudaoSuggest","parameters":[{"name":"q","in":"query","description":"要检索查询的单词，例如love/computer","required":true,"type":"string"},{"name":"doctype","in":"query","description":"返回的数据类型，支持json和xml两种格式，默认情况下json数据","required":false,"type":"string"}]}}}}',
      description: 'Api tool provider openapi schema',
    }),
    headers: z
      .array(
        z.object({
          key: z
            .string()
            .openapi({ example: 'Authorization', description: 'Header key' }),
          value: z.string().openapi({
            example: 'Bearer xxxxxxxxx',
            description: 'Header value',
          }),
        }),
      )
      .openapi({
        example: [{ key: 'Authorization', value: 'Bearer xxxxxxxxx' }],
        description: 'Api tool provider headers',
      }),
    createdAt: z.number().openapi({
      example: 1622697600000,
      description: 'Api tool provider created time',
    }),
  }),
);

export type GetApiToolProviderRes = z.infer<typeof getApiToolProviderResSchema>;

export const getApiToolProviderRoute = describeRoute({
  tags: ['api-tools'],
  description: 'Get the api tool provider by id',
  responses: {
    200: {
      description: 'Successful get the api tool provider',
      content: {
        'application/json': {
          schema: resolver(getApiToolProviderResSchema),
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
