import type { PrismaClient } from "../../generated/prisma/client";
import { buildSystemFilters } from "../../services/lead-filter.service";
import type { AuthContext } from "../../types/auth.types";
import type { LeadQueryResult } from "../../types/lead-query.result.types";
import type { LeadQueryInput } from "../../validators/lead-query.schema";
import type { ILeadRepository } from "../interfaces/lead.repository.interface";

export class LeadRepository implements ILeadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async queryLeads(
    query: LeadQueryInput,
    auth: AuthContext,
  ): Promise<LeadQueryResult> {
    const systemFilters = buildSystemFilters(query.filters);
    const where = {
      tenantId: auth.tenantId,
      ...(auth.role === "AGENT"
        ? {
            assignedTo: auth.userId,
          }
        : {}),
      ...(systemFilters.length > 0
        ? query.logic === "AND"
          ? { AND: systemFilters }
          : { OR: systemFilters }
        : {}),
    };
    console.log("systemFilters", systemFilters);
    console.log("where", where);
    const leads = await this.prisma.lead.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await this.prisma.lead.count({
      where,
    });

    return {
      leads: leads.map((lead) => ({
        ...lead,
        customFields: [],
      })),
      total,
      page: query.page,
      limit: query.limit,
    };
  }
}
