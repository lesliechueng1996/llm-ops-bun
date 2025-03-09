import { z, type ZodSchema } from 'zod';
import 'zod-openapi/extend';
import type { ValidationTargets } from 'hono';
import { validator } from 'hono-openapi/zod';
import { BadRequestApiError } from './exception';

export { z };

export enum HttpCode {
  OK = '200',
  BAD_REQUEST = '400',
  UNAUTHORIZED = '401',
  FORBIDDEN = '403',
  NOT_FOUND = '404',
  INTERNAL_SERVER_ERROR = '500',
}

export const wrapResponseSchema = <T>(data: z.ZodType<T>) => {
  return z.object({
    code: z
      .nativeEnum(HttpCode)
      .openapi({ example: HttpCode.OK, description: 'HTTP status code' }),
    message: z
      .string()
      .openapi({ example: 'ok', description: 'Response message' }),
    data,
  });
};

export const successEmptyResponseSchema = wrapResponseSchema(z.object({}));

export const errorResponseSchema = z.object({
  code: z.nativeEnum(HttpCode).openapi({
    example: HttpCode.BAD_REQUEST,
    description: 'HTTP status code',
  }),
  message: z
    .string()
    .openapi({ example: 'error', description: 'Error message' }),
  data: z.nullable(z.unknown()).openapi({ example: null, description: 'Null' }),
});

export type BaseResponse<T> = z.infer<ReturnType<typeof wrapResponseSchema<T>>>;

export const ok = <T>(data: T): BaseResponse<T> => ({
  code: HttpCode.OK,
  message: 'ok',
  data,
});

export const okMessage = (message: string): BaseResponse<null> => ({
  code: HttpCode.OK,
  message,
  data: null,
});

export const badRequest = (message: string): BaseResponse<null> => ({
  code: HttpCode.BAD_REQUEST,
  message,
  data: null,
});

export const unauthorized = (message: string): BaseResponse<null> => ({
  code: HttpCode.UNAUTHORIZED,
  message,
  data: null,
});

export const forbidden = (message: string): BaseResponse<null> => ({
  code: HttpCode.FORBIDDEN,
  message,
  data: null,
});

export const notFound = (message: string): BaseResponse<null> => ({
  code: HttpCode.NOT_FOUND,
  message,
  data: null,
});

export const internalServerError = (message: string): BaseResponse<null> => ({
  code: HttpCode.INTERNAL_SERVER_ERROR,
  message,
  data: null,
});

export const zValidator = <
  T extends ZodSchema,
  Target extends keyof ValidationTargets,
>(
  target: Target,
  schema: T,
) => {
  return validator(target, schema, (result) => {
    if (!result.success) {
      const firstErrorMsg = result.error.errors[0].message;
      throw new BadRequestApiError(firstErrorMsg);
    }
  });
};
