import type { PrismaClient } from "../../generated/prisma/client";
import {
  buildCustomFilters,
  buildSystemFilters,
} from "../../services/lead-filter.service";
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
    const customFilters = buildCustomFilters(query.filters);
    const filterConditions = [...systemFilters, ...customFilters];
    const where = {
      tenantId: auth.tenantId,
      ...(auth.role === "AGENT"
        ? {
            assignedTo: auth.userId,
          }
        : {}),
      ...(filterConditions.length > 0
        ? query.logic === "AND"
          ? { AND: filterConditions }
          : { OR: filterConditions }
        : {}),
    };
    console.log("systemFilters", systemFilters);
    console.log("customFilters", customFilters);
    console.log("where", where);

    const arun = await this.prisma.lead.findUnique({
      where: {
        id: "33333333-3333-4333-8333-333333333333",
      },
      select: {
        id: true,
        name: true,
        assignedTo: true,
        tenantId: true,
      },
    });

    console.log("ARUN:", arun);
    const allLeads = await this.prisma.lead.findMany({
      where: {
        tenantId: auth.tenantId,
      },
      select: {
        id: true,
        name: true,
        tenantId: true,
        customValues: {
          select: {
            fieldId: true,
            value: true,
          },
        },
      },
    });

    // console.log("TENANT LEADS", JSON.stringify(allLeads, null, 2));
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
