import type { NextFunction, Request, Response } from "express";
import { Messages } from "../constants/messages";
import type { AuthContext, UserRole } from "../types/auth.types";

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const tenantId = req.header("x-tenant-id");
    const userId = req.header("x-user-id");
    const role = req.header("x-user-role");

    if (!tenantId || !userId || !role) {
      const error = new Error(Messages.AUTH.UNAUTHORIZED);
      next(error);
      return;
    }
    const allowedRoles = ["OWNER", "ADMIN", "MANAGER", "AGENT"] as const;

    if (!allowedRoles.includes(role as UserRole)) {
      next(new Error(Messages.AUTH.UNAUTHORIZED));
      return;
    }

    const authContext: AuthContext = {
      tenantId,
      userId,
      role: role as UserRole,
    };

    req.auth = authContext;

    next();
  } catch (error) {
    next(error);
  }
};
