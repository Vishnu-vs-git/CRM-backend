import type { AuthContext } from "../types/auth.types";
import type { LeadQueryInput } from "../validators/lead-query.schema";

export class LeadService {
  async queryLeads(query: LeadQueryInput, auth: AuthContext) {
    console.log("Query:", query);
    console.log("Auth:", auth);

    return {
      data: [],
      page: query.page,
      limit: query.limit,
      total: 0,
    };
  }
}
