import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      ...req.body,
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortDirection: req.query.sortDirection,
    });

    if (!result.success) {
      return next(result.error);
    }

    req.body = result.data;

    next();
  };
};
