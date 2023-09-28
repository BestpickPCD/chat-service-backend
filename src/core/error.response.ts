import { response } from "./response/index.ts";

class ErrorResponse extends Error {
  subMessage: string | undefined;
  statusCode: number;
  constructor(message: string, subMessage: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.subMessage = subMessage;
  }
}
class ConflictRequestError extends ErrorResponse {
  constructor(message: string, subMessage?: string, statusCode?: number) {
    super(
      message,
      subMessage || response.message.CONFLICT,
      statusCode || response.code.CONFLICT
    );
  }
}
class BadRequestError extends ErrorResponse {
  constructor(message: string, subMessage?: string, statusCode?: number) {
    super(
      message,
      subMessage || response.message.BAD_REQUEST,
      statusCode || response.code.BAD_REQUEST
    );
  }
}
class NotFoundRequestError extends ErrorResponse {
  constructor(message: string, subMessage?: string, statusCode?: number) {
    super(
      message,
      subMessage || response.message.NOT_FOUND,
      statusCode || response.code.NOT_FOUND
    );
  }
}
class ForbiddenRequestError extends ErrorResponse {
  constructor(message: string, subMessage?: string, statusCode?: number) {
    super(
      message,
      subMessage || response.message.FORBIDDEN,
      statusCode || response.code.FORBIDDEN
    );
  }
}
class UnauthorizeRequestError extends ErrorResponse {
  constructor(message: string, subMessage?: string, statusCode?: number) {
    super(
      message,
      subMessage || response.message.UNAUTHORIZED,
      statusCode || response.code.UNAUTHORIZED
    );
  }
}

export {
  ConflictRequestError,
  BadRequestError,
  NotFoundRequestError,
  ForbiddenRequestError,
  UnauthorizeRequestError,
};
