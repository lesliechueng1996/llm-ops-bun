import { ALLOWED_PARAMETER_TYPE } from 'lib-api-tool';
import { describeRoute } from 'hono-openapi';
import { errorResponseSchema, z, zValidator } from '../common';
import { resolver } from 'hono-openapi/zod';

const getApiToolReqSchema = z.object({
  providerId: z
    .string()
    .openapi({ description: 'Api tool provider id', example: 'xxxxxxxx' }),
  operationId: z
    .string()
    .openapi({ description: 'Api tool operation id', example: 'xxxxxxxx' }),
});

export type GetApiToolReq = z.infer<typeof getApiToolReqSchema>;

export const getApiToolValidator = zValidator('param', getApiToolReqSchema);

const getApiToolResSchema = z.object({
  id: z.string().openapi({ description: 'Api tool id', example: 'xxxxxxxx' }),
  name: z
    .string()
    .openapi({ description: 'Api tool name(Operation ID)', example: '搜索' }),
  description: z
    .string()
    .openapi({ description: 'Api tool description', example: '搜索商品' }),
  inputs: z
    .array(
      z.object({
        type: z
          .enum(ALLOWED_PARAMETER_TYPE)
          .openapi({ description: 'Parameter type', example: 'string' }),
        name: z
          .string()
          .openapi({ description: 'Parameter name', example: 'keyword' }),
        description: z.string().openapi({
          description: 'Parameter description',
          example: '搜索关键字',
        }),
        required: z
          .boolean()
          .openapi({ description: 'Is parameter required', example: true }),
      }),
    )
    .openapi({
      description: 'Api tool inputs',
      example: [
        {
          type: 'string',
          name: 'keyword',
          description: '搜索关键字',
          required: true,
        },
      ],
    }),
  provider: z.object({
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
      example: '谷歌搜索',
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
  }),
});

export type GetApiToolRes = z.infer<typeof getApiToolResSchema>;

export const getApiToolRoute = describeRoute({
  tags: ['api-tools'],
  description: 'Get the api tool by provider id and operation id',
  responses: {
    200: {
      description: 'Successful get the api tool',
      content: {
        'application/json': {
          schema: resolver(getApiToolResSchema),
        },
      },
    },
    404: {
      description: 'Api tool not found',
      content: {
        'application/json': {
          schema: resolver(errorResponseSchema),
        },
      },
    },
  },
});
