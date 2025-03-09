import { ALLOWED_PARAMETER_TYPE } from 'lib-api-tool';
import { describeRoute } from 'hono-openapi';
import { z, zValidator } from '../common';
import { resolver } from 'hono-openapi/zod';
import { paginatorSearchReqSchema, wrapPaginatorResSchema } from '../paginator';

const getApiToolsReqSchema = paginatorSearchReqSchema;

export type GetApiToolsReq = z.infer<typeof getApiToolsReqSchema>;

export const getApiToolsValidator = zValidator('query', getApiToolsReqSchema);

const getApiToolsResSchema = wrapPaginatorResSchema(
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
    description: z.string().openapi({
      example: '这是一个查询对应英文单词字典的工具',
      description: 'Api tool provider description',
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
    tools: z
      .array(
        z.object({
          id: z
            .string()
            .openapi({ example: 'xxxxxxxxx', description: 'Api tool id' }),
          name: z
            .string()
            .openapi({ example: '谷歌搜索', description: 'Api tool name' }),
          description: z.string().openapi({
            example: '这是一个查询对应英文单词字典的工具',
            description: 'Api tool description',
          }),
          inputs: z.array(
            z.object({
              type: z
                .enum(ALLOWED_PARAMETER_TYPE)
                .openapi({ example: 'string', description: 'Input type' }),
              name: z
                .string()
                .openapi({ example: 'q', description: 'Input name' }),
              description: z.string().openapi({
                example: '要检索查询的单词，例如love/computer',
                description: 'Input description',
              }),
              required: z
                .boolean()
                .openapi({ example: true, description: 'Input required' }),
            }),
          ),
        }),
      )
      .openapi({
        example: [
          {
            id: 'xxxxxxxxx',
            name: '谷歌搜索',
            description: '这是一个查询对应英文单词字典的工具',
            inputs: [
              {
                type: 'string',
                name: 'q',
                description: '要检索查询的单词，例如love/computer',
                required: true,
              },
            ],
          },
        ],
        description: 'Api tools',
      }),
  }),
);

export type GetApiToolsRes = z.infer<typeof getApiToolsResSchema>;

export const getApiToolsRoute = describeRoute({
  tags: ['api-tools'],
  description: 'Get api tools by pagination',
  responses: {
    200: {
      description: 'Successful get api tools',
      content: {
        'application/json': {
          schema: resolver(getApiToolsResSchema),
        },
      },
    },
  },
});
