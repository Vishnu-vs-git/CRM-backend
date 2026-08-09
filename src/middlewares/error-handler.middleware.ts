import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpStatus } from "../constants/http.status";
import { Messages } from "../constants/messages";
import { AppError } from "../errors/app.error";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof ZodError) {
    const message = error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    return res.status(HttpStatus.BAD_REQUEST).json({
      message,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      statusCode: error.statusCode,
    });
  }

  console.error(error);

  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    message: Messages.SERVER.INTERNAL_ERROR,
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  });
};
