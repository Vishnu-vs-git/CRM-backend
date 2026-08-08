import type { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../constants/http.status";
import { Messages } from "../constants/messages";
import { LeadService } from "../services/lead.service";
import type { LeadQueryInput } from "../validators/lead-query.schema";

export class LeadController {
  private readonly leadService: LeadService;
  constructor() {
    this.leadService = new LeadService();
  }
  async query(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.body as LeadQueryInput;

      const result = await this.leadService.queryLeads(query, req.auth);

      res.status(HttpStatus.OK).json({
        success: true,
        message: Messages.LEAD.FETCH_SUCCESS,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
