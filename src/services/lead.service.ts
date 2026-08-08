import type { ILeadRepository } from "../repositories/interfaces/lead.repository.interface";
import type { AuthContext } from "../types/auth.types";
import type { LeadQueryResult } from "../types/lead-query.result.types";
import type { LeadQueryInput } from "../validators/lead-query.schema";

export class LeadService {
  constructor(private readonly leadRepository: ILeadRepository) {}
  async queryLeads(
    query: LeadQueryInput,
    auth: AuthContext,
  ): Promise<LeadQueryResult> {
    return this.leadRepository.queryLeads(query, auth);
  }
}
