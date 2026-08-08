import type { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../constants/http.status";
import { Messages } from "../constants/messages";
import type { LeadQueryInput } from "../validators/lead-query.schema";

export class LeadController {
  async query(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.body as LeadQueryInput;

      console.log(query);

      res.status(HttpStatus.OK).json({
        success: true,
        message: Messages.LEAD.FETCH_SUCCESS,
        data: [],
      });
    } catch (error) {
      next(error);
    }
  }
}
