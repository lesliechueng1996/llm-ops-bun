import { describe, expect, test, mock, afterAll, afterEach } from 'bun:test';
import {
  HttpCode,
  wrapResponseSchema,
  successEmptyResponseSchema,
  errorResponseSchema,
  ok,
  okMessage,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  internalServerError,
  z,
  zValidator,
} from '../lib/common';
import type { BaseResponse } from '../lib/common';
import { BadRequestApiError } from '../lib/exception';

const validatorMock = mock((param1, param2, callback) => mock());

mock.module('hono-openapi/zod', () => ({
  validator: validatorMock,
}));

describe('HttpCode', () => {
  test('should have correct enum values', () => {
    expect(HttpCode.OK as string).toBe('200');
    expect(HttpCode.BAD_REQUEST as string).toBe('400');
    expect(HttpCode.UNAUTHORIZED as string).toBe('401');
    expect(HttpCode.FORBIDDEN as string).toBe('403');
    expect(HttpCode.NOT_FOUND as string).toBe('404');
    expect(HttpCode.INTERNAL_SERVER_ERROR as string).toBe('500');
  });
});

describe('wrapResponseSchema', () => {
  test('should correctly wrap data schema', () => {
    const testSchema = z.object({
      test: z.string(),
    });

    const wrappedSchema = wrapResponseSchema(testSchema);

    // Validate schema structure
    expect(wrappedSchema.shape.code).toBeDefined();
    expect(wrappedSchema.shape.message).toBeDefined();
    expect(wrappedSchema.shape.data).toBeDefined();

    // Validate data parsing
    const validData = {
      code: HttpCode.OK,
      message: 'ok',
      data: { test: 'test value' },
    };

    const result = wrappedSchema.safeParse(validData);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.code).toBe(HttpCode.OK);
      expect(result.data.message).toBe('ok');
      expect(result.data.data.test).toBe('test value');
    }
  });
});

describe('successEmptyResponseSchema', () => {
  test('should be a valid empty data response schema', () => {
    const validData = {
      code: HttpCode.OK,
      message: 'ok',
      data: {},
    };

    const result = successEmptyResponseSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('errorResponseSchema', () => {
  test('should be a valid error response schema', () => {
    const validData = {
      code: HttpCode.BAD_REQUEST,
      message: 'error message',
      data: null,
    };

    const result = errorResponseSchema.safeParse(validData);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.code).toBe(HttpCode.BAD_REQUEST);
      expect(result.data.message).toBe('error message');
      expect(result.data.data).toBeNull();
    }
  });
});

describe('Response Helper Functions', () => {
  test('ok function should return correct success response', () => {
    const data = { test: 'value' };
    const response = ok(data);

    expect(response.code).toBe(HttpCode.OK);
    expect(response.message).toBe('ok');
    expect(response.data).toEqual(data);
  });

  test('okMessage function should return success response with custom message', () => {
    const message = 'Operation successful';
    const response = okMessage(message);

    expect(response.code).toBe(HttpCode.OK);
    expect(response.message).toBe(message);
    expect(response.data).toBeNull();
  });

  test('badRequest function should return correct error response', () => {
    const message = 'Invalid request parameters';
    const response = badRequest(message);

    expect(response.code).toBe(HttpCode.BAD_REQUEST);
    expect(response.message).toBe(message);
    expect(response.data).toBeNull();
  });

  test('unauthorized function should return correct unauthorized response', () => {
    const message = 'Unauthorized access';
    const response = unauthorized(message);

    expect(response.code).toBe(HttpCode.UNAUTHORIZED);
    expect(response.message).toBe(message);
    expect(response.data).toBeNull();
  });

  test('forbidden function should return correct forbidden response', () => {
    const message = 'Access forbidden';
    const response = forbidden(message);

    expect(response.code).toBe(HttpCode.FORBIDDEN);
    expect(response.message).toBe(message);
    expect(response.data).toBeNull();
  });

  test('notFound function should return correct not found response', () => {
    const message = 'Resource not found';
    const response = notFound(message);

    expect(response.code).toBe(HttpCode.NOT_FOUND);
    expect(response.message).toBe(message);
    expect(response.data).toBeNull();
  });

  test('internalServerError function should return correct server error response', () => {
    const message = 'Internal server error';
    const response = internalServerError(message);

    expect(response.code).toBe(HttpCode.INTERNAL_SERVER_ERROR);
    expect(response.message).toBe(message);
    expect(response.data).toBeNull();
  });
});

describe('Type Tests', () => {
  test('BaseResponse type should infer correctly', () => {
    // This is a type test, only verifying compilation
    const response: BaseResponse<{ id: number }> = {
      code: HttpCode.OK,
      message: 'ok',
      data: { id: 123 },
    };

    expect(response.code).toBe(HttpCode.OK);
    expect(response.message).toBe('ok');
    expect(response.data.id).toBe(123);
  });
});

describe('zValidator', () => {
  afterEach(() => {
    validatorMock.mockClear();
  });

  test('should return a function', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number().int().positive(),
    });

    const validatorFn = zValidator('json', schema);

    expect(typeof validatorFn).toBe('function');
  });

  test('should handle validation errors correctly', () => {
    // 创建一个简单的 schema
    const schema = z.object({
      name: z.string(),
      age: z.number().int().positive(),
    });

    zValidator('json', schema);
    const callback = validatorMock.mock.calls[0][2];

    try {
      callback({
        success: true,
      });
    } catch {
      expect(true).toBe(false);
    }

    try {
      callback({
        success: false,
        error: {
          errors: [
            {
              message: 'error message',
            },
          ],
        },
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestApiError);
      const badRequestError = error as BadRequestApiError;
      expect(badRequestError.message).toBe('error message');
    }
  });
});
