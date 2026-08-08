import type { Lead } from "./lead.types";

export interface LeadQueryResult {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
}
