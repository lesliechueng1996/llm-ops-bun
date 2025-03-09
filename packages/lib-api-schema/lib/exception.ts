import {
  badRequest,
  type BaseResponse,
  HttpCode,
  notFound,
  unauthorized,
} from './common';

export class ApiError extends Error {
  constructor(
    public code: HttpCode,
    message: string,
  ) {
    super(message);
  }

  toResponse(): BaseResponse<null> {
    return {
      code: this.code,
      message: this.message,
      data: null,
    };
  }

  statusCode(): number {
    return Number.parseInt(this.code);
  }
}

export class BadRequestApiError extends ApiError {
  constructor(message: string) {
    super(HttpCode.BAD_REQUEST, message);
  }

  toResponse(): BaseResponse<null> {
    return badRequest(this.message);
  }
}

export class NotFoundApiError extends ApiError {
  constructor(message: string) {
    super(HttpCode.NOT_FOUND, message);
  }

  toResponse(): BaseResponse<null> {
    return notFound(this.message);
  }
}

export class UnauthorizedApiError extends ApiError {
  constructor(message: string) {
    super(HttpCode.UNAUTHORIZED, message);
  }

  toResponse(): BaseResponse<null> {
    return unauthorized(this.message);
  }
}
