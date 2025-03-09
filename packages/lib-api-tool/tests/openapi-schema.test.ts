import { describe, test, expect } from 'bun:test';
import {
  validateOpenapiSchema,
  ALLOWED_PARAMETER_TYPE,
} from '../lib/openapi-schema';
import type { Openapi } from '../lib/openapi-schema';
import { BadRequestApiError } from 'lib-api-schema';

describe('validateOpenapiSchema', () => {
  test('should successfully validate a valid OpenAPI schema', () => {
    const validSchema = {
      server: 'https://api.example.com',
      description: '测试 API',
      paths: {
        '/users': {
          get: {
            description: '获取用户列表',
            operationId: 'getUsers',
            parameters: [
              {
                name: 'limit',
                in: 'query' as const,
                description: '每页数量',
                required: false,
                type: 'integer' as const,
              },
            ],
          },
          post: {
            description: '创建用户',
            operationId: 'createUser',
            parameters: [
              {
                name: 'user',
                in: 'body' as const,
                description: '用户信息',
                required: true,
                type: 'string' as const,
              },
            ],
          },
        },
        '/users/{id}': {
          get: {
            description: '获取用户详情',
            operationId: 'getUserById',
            parameters: [
              {
                name: 'id',
                in: 'path' as const,
                description: '用户ID',
                required: true,
                type: 'string' as const,
              },
            ],
          },
        },
      },
    } as Openapi;

    const result = validateOpenapiSchema(JSON.stringify(validSchema));
    expect(result).toEqual(validSchema);
  });

  test('should throw an error when server is not a valid URL', () => {
    const invalidSchema = {
      server: 'invalid-url',
      description: '测试 API',
      paths: {
        '/users': {
          get: {
            description: '获取用户列表',
            operationId: 'getUsers',
            parameters: [],
          },
        },
      },
    };

    expect(() => validateOpenapiSchema(JSON.stringify(invalidSchema))).toThrow(
      BadRequestApiError,
    );
  });

  test('should throw an error when description is empty', () => {
    const invalidSchema = {
      server: 'https://api.example.com',
      description: '',
      paths: {
        '/users': {
          get: {
            description: '获取用户列表',
            operationId: 'getUsers',
            parameters: [],
          },
        },
      },
    };

    expect(() => validateOpenapiSchema(JSON.stringify(invalidSchema))).toThrow(
      BadRequestApiError,
    );
  });

  test('should throw an error when HTTP method is not in the allowed list', () => {
    const invalidSchema = {
      server: 'https://api.example.com',
      description: '测试 API',
      paths: {
        '/users': {
          invalid: {
            description: '获取用户列表',
            operationId: 'getUsers',
            parameters: [],
          },
        },
      },
    };

    expect(() => validateOpenapiSchema(JSON.stringify(invalidSchema))).toThrow(
      BadRequestApiError,
    );
  });

  test('should throw an error when path operation description is empty', () => {
    const invalidSchema = {
      server: 'https://api.example.com',
      description: '测试 API',
      paths: {
        '/users': {
          get: {
            description: '',
            operationId: 'getUsers',
            parameters: [],
          },
        },
      },
    };

    expect(() => validateOpenapiSchema(JSON.stringify(invalidSchema))).toThrow(
      BadRequestApiError,
    );
  });

  test('should throw an error when path operation operationId is empty', () => {
    const invalidSchema = {
      server: 'https://api.example.com',
      description: '测试 API',
      paths: {
        '/users': {
          get: {
            description: '获取用户列表',
            operationId: '',
            parameters: [],
          },
        },
      },
    };

    expect(() => validateOpenapiSchema(JSON.stringify(invalidSchema))).toThrow(
      BadRequestApiError,
    );
  });

  test('should throw an error when parameter name is empty', () => {
    const invalidSchema = {
      server: 'https://api.example.com',
      description: '测试 API',
      paths: {
        '/users': {
          get: {
            description: '获取用户列表',
            operationId: 'getUsers',
            parameters: [
              {
                name: '',
                in: 'query' as const,
                description: '每页数量',
                required: false,
                type: 'integer' as const,
              },
            ],
          },
        },
      },
    };

    expect(() => validateOpenapiSchema(JSON.stringify(invalidSchema))).toThrow(
      BadRequestApiError,
    );
  });

  test('should throw an error when parameter in is not in the allowed list', () => {
    const invalidSchema = {
      server: 'https://api.example.com',
      description: '测试 API',
      paths: {
        '/users': {
          get: {
            description: '获取用户列表',
            operationId: 'getUsers',
            parameters: [
              {
                name: 'limit',
                in: 'invalid',
                description: '每页数量',
                required: false,
                type: 'integer' as const,
              },
            ],
          },
        },
      },
    };

    expect(() => validateOpenapiSchema(JSON.stringify(invalidSchema))).toThrow(
      BadRequestApiError,
    );
  });

  test('should throw an error when parameter description is empty', () => {
    const invalidSchema = {
      server: 'https://api.example.com',
      description: '测试 API',
      paths: {
        '/users': {
          get: {
            description: '获取用户列表',
            operationId: 'getUsers',
            parameters: [
              {
                name: 'limit',
                in: 'query' as const,
                description: '',
                required: false,
                type: 'integer' as const,
              },
            ],
          },
        },
      },
    };

    expect(() => validateOpenapiSchema(JSON.stringify(invalidSchema))).toThrow(
      BadRequestApiError,
    );
  });

  test('should throw an error when parameter type is not in the allowed list', () => {
    const invalidSchema = {
      server: 'https://api.example.com',
      description: '测试 API',
      paths: {
        '/users': {
          get: {
            description: '获取用户列表',
            operationId: 'getUsers',
            parameters: [
              {
                name: 'limit',
                in: 'query' as const,
                description: '每页数量',
                required: false,
                type: 'invalid',
              },
            ],
          },
        },
      },
    };

    expect(() => validateOpenapiSchema(JSON.stringify(invalidSchema))).toThrow(
      BadRequestApiError,
    );
  });

  test('should throw an error when there are duplicate operationIds', () => {
    const invalidSchema = {
      server: 'https://api.example.com',
      description: '测试 API',
      paths: {
        '/users': {
          get: {
            description: '获取用户列表',
            operationId: 'duplicateId',
            parameters: [],
          },
        },
        '/posts': {
          get: {
            description: '获取文章列表',
            operationId: 'duplicateId',
            parameters: [],
          },
        },
      },
    };

    expect(() => validateOpenapiSchema(JSON.stringify(invalidSchema))).toThrow(
      BadRequestApiError,
    );
  });

  test('should throw an error when JSON format is invalid', () => {
    const invalidJson = '{invalid json}';

    expect(() => validateOpenapiSchema(invalidJson)).toThrow(
      BadRequestApiError,
    );
  });

  test('ALLOWED_PARAMETER_TYPE constant should contain correct values', () => {
    expect(ALLOWED_PARAMETER_TYPE).toEqual([
      'string',
      'integer',
      'float',
      'boolean',
    ]);
  });
});
