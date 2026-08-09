import type { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../constants/http.status";
import { Messages } from "../constants/messages";
import type { LeadService } from "../services/lead.service";
import type { LeadQueryInput } from "../validators/lead-query.schema";

export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  async query(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.body as LeadQueryInput;

      const result = await this.leadService.queryLeads(query, req.auth);

      res.status(HttpStatus.OK).json({
        status: "success",
        message: Messages.LEAD.FETCH_SUCCESS,
        data: result.leads,
        meta: {
          page: result.page,
          limit: result.limit,
          totalRecords: result.total,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
