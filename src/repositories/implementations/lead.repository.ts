import type { PrismaClient } from "../../generated/prisma/client";
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
    const where = {
      tenantId: auth.tenantId,
      ...(auth.role === "AGENT"
        ? {
            assignedTo: auth.userId,
          }
        : {}),
    };

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
