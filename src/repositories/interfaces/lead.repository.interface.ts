import type { AuthContext } from "../../types/auth.types";
import type { FieldIdResult } from "../../types/fieldId-result.type";
import type { LeadQueryResult } from "../../types/lead-query.result.types";
import type { LeadQueryInput } from "../../validators/lead-query.schema";

export interface ILeadRepository {
  queryLeads(
    query: LeadQueryInput,
    auth: AuthContext,
  ): Promise<LeadQueryResult>;
  findByIds(fieldIds: string[], tenantId: string): Promise<FieldIdResult[]>;
}
