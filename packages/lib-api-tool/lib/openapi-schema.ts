import { logger } from 'lib-logger';
import { z } from 'zod';
import { BadRequestApiError } from 'lib-api-schema';

const ALLOWED_METHODS = ['get', 'post', 'put', 'delete', 'patch'] as const;
const ALLOWED_PARAMETER_LOCATIONS = [
  'path',
  'query',
  'header',
  'cookie',
  'body',
] as const;
export const ALLOWED_PARAMETER_TYPE = [
  'string',
  'integer',
  'float',
  'boolean',
] as const;

const ParameterSchema = z.array(
  z.object({
    name: z.string().trim().nonempty({ message: 'name 应是一个非空的字符串' }),
    in: z.enum(ALLOWED_PARAMETER_LOCATIONS, {
      message: 'in 应是 path, query, header, cookie, body 其中之一',
    }),
    description: z
      .string()
      .trim()
      .nonempty({ message: 'description 应是一个非空的字符串' }),
    required: z.boolean({ message: 'required 应是一个布尔值' }),
    type: z.enum(ALLOWED_PARAMETER_TYPE, {
      message: 'type 应是 string, integer, float, boolean 其中之一',
    }),
  }),
  { message: 'parameters 应是一个对象数组' },
);

export type ApiToolParameter = z.infer<typeof ParameterSchema>;

const OpenapiSchema = z.object({
  server: z.string().url({ message: 'server 应是一个合法的 url' }),
  description: z
    .string()
    .trim()
    .nonempty({ message: 'description 应是一个非空的字符串' }),
  paths: z.record(
    z.string(),
    z.record(
      z.enum(ALLOWED_METHODS, {
        message: 'method 应是 get, post, put, delete, patch 其中之一',
      }),
      z.object({
        description: z
          .string()
          .trim()
          .nonempty({ message: 'description 应是一个非空的字符串' }),
        operationId: z
          .string()
          .trim()
          .nonempty({ message: 'operationId 应是一个非空的字符串' }),
        parameters: ParameterSchema,
      }),
    ),
    { message: 'paths 应是一个对象' },
  ),
});

export type Openapi = z.infer<typeof OpenapiSchema>;

export const validateOpenapiSchema = (str: string): Openapi => {
  try {
    const result = OpenapiSchema.safeParse(JSON.parse(str));
    if (!result.success) {
      logger.error(
        result.error.errors.map((error) => error.message).join(', '),
        'validate openapi schema error',
      );
      throw new BadRequestApiError(
        result.error.errors.map((error) => error.message).join(', '),
      );
    }
    const data = result.data;
    const operationIds = new Set<string>();
    for (const [_, methods] of Object.entries(data.paths)) {
      for (const [_, { operationId }] of Object.entries(methods)) {
        if (operationIds.has(operationId)) {
          logger.error(
            `operationId ${operationId} 重复`,
            'validate openapi schema error',
          );
          throw new BadRequestApiError(`operationId ${operationId} 重复`);
        }
        operationIds.add(operationId);
      }
    }

    return data;
  } catch (err) {
    if (err instanceof BadRequestApiError) {
      throw err;
    }

    logger.error(err, 'validate openapi schema error');
    throw new BadRequestApiError('openapi schema 格式错误');
  }
};
