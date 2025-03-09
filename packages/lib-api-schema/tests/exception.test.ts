import { describe, expect, it } from 'bun:test';
import {
  ApiError,
  BadRequestApiError,
  NotFoundApiError,
  UnauthorizedApiError,
} from '../lib/exception';
import { HttpCode } from '../lib/common';

describe('ApiError', () => {
  it('should create an instance with the correct properties', () => {
    const error = new ApiError(HttpCode.BAD_REQUEST, '错误信息');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe(HttpCode.BAD_REQUEST);
    expect(error.message).toBe('错误信息');
  });

  it('should convert to response correctly', () => {
    const error = new ApiError(HttpCode.BAD_REQUEST, '错误信息');
    const response = error.toResponse();

    expect(response).toEqual({
      code: HttpCode.BAD_REQUEST,
      message: '错误信息',
      data: null,
    });
  });

  it('should return correct status code', () => {
    const error = new ApiError(HttpCode.BAD_REQUEST, '错误信息');

    expect(error.statusCode()).toBe(400);
  });
});

describe('BadRequestApiError', () => {
  it('should create an instance with the correct properties', () => {
    const error = new BadRequestApiError('错误请求');

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toBeInstanceOf(BadRequestApiError);
    expect(error.code).toBe(HttpCode.BAD_REQUEST);
    expect(error.message).toBe('错误请求');
  });

  it('should convert to response correctly', () => {
    const error = new BadRequestApiError('错误请求');
    const response = error.toResponse();

    expect(response).toEqual({
      code: HttpCode.BAD_REQUEST,
      message: '错误请求',
      data: null,
    });
  });
});

describe('NotFoundApiError', () => {
  it('should create an instance with the correct properties', () => {
    const error = new NotFoundApiError('资源未找到');

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toBeInstanceOf(NotFoundApiError);
    expect(error.code).toBe(HttpCode.NOT_FOUND);
    expect(error.message).toBe('资源未找到');
  });

  it('should convert to response correctly', () => {
    const error = new NotFoundApiError('资源未找到');
    const response = error.toResponse();

    expect(response).toEqual({
      code: HttpCode.NOT_FOUND,
      message: '资源未找到',
      data: null,
    });
  });
});

describe('UnauthorizedApiError', () => {
  it('should create an instance with the correct properties', () => {
    const error = new UnauthorizedApiError('未授权访问');

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toBeInstanceOf(UnauthorizedApiError);
    expect(error.code).toBe(HttpCode.UNAUTHORIZED);
    expect(error.message).toBe('未授权访问');
  });

  it('should convert to response correctly', () => {
    const error = new UnauthorizedApiError('未授权访问');
    const response = error.toResponse();

    expect(response).toEqual({
      code: HttpCode.UNAUTHORIZED,
      message: '未授权访问',
      data: null,
    });
  });
});
