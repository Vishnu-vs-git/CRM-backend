import { HttpStatus } from "../constants/http.status";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(HttpStatus.BAD_REQUEST, message);
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message: string) {
    super(HttpStatus.UNAUTHORIZED, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(HttpStatus.FORBIDDEN, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(HttpStatus.NOT_FOUND, message);
  }
}
