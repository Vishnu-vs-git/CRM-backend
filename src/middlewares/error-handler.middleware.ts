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
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: Messages.VALIDATION.FAILED,
      errors: error.issues,
    });
  }
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  console.error(error);

  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: Messages.SERVER.INTERNAL_ERROR,
  });
};
