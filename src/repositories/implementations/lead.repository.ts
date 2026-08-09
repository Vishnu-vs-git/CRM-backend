import { BadRequestError } from "../../errors/app.error";
import type { PrismaClient } from "../../generated/prisma/client";
import {
  buildCustomFilters,
  buildSystemFilters,
  getNumberFilters,
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

    const numberFilters = getNumberFilters(query.filters);

    const numberFilterConditions = [];

    for (const filter of numberFilters) {
      if (filter.value === undefined) {
        throw new BadRequestError(
          `Value is required for custom field '${filter.fieldId}'`,
        );
      }

      const numericValue = Number(filter.value);

      if (Number.isNaN(numericValue)) {
        throw new BadRequestError(
          `Invalid number value for custom field '${filter.fieldId}'`,
        );
      }

      let matchingRows: { leadId: string }[];

      switch (filter.condition) {
        case "is":
          matchingRows = await this.prisma.$queryRaw<{ leadId: string }[]>`
        SELECT "leadId"
        FROM "lead_custom_field_values"
        WHERE "fieldId" = ${filter.fieldId}::uuid
          AND "value" ~ '^-?[0-9]+(\\.[0-9]+)?$'
          AND "value"::numeric = ${numericValue}
      `;
          break;

        case "is not":
          matchingRows = await this.prisma.$queryRaw<{ leadId: string }[]>`
        SELECT "leadId"
        FROM "lead_custom_field_values"
        WHERE "fieldId" = ${filter.fieldId}::uuid
          AND "value" ~ '^-?[0-9]+(\\.[0-9]+)?$'
          AND "value"::numeric != ${numericValue}
      `;
          break;

        case "greater than":
          matchingRows = await this.prisma.$queryRaw<{ leadId: string }[]>`
        SELECT "leadId"
        FROM "lead_custom_field_values"
        WHERE "fieldId" = ${filter.fieldId}::uuid
          AND "value" ~ '^-?[0-9]+(\\.[0-9]+)?$'
          AND "value"::numeric > ${numericValue}
      `;
          break;

        case "less than":
          matchingRows = await this.prisma.$queryRaw<{ leadId: string }[]>`
        SELECT "leadId"
        FROM "lead_custom_field_values"
        WHERE "fieldId" = ${filter.fieldId}::uuid
          AND "value" ~ '^-?[0-9]+(\\.[0-9]+)?$'
          AND "value"::numeric < ${numericValue}
      `;
          break;

        default:
          throw new BadRequestError(
            `Condition '${filter.condition}' is not supported for number field '${filter.fieldId}'`,
          );
      }

      const matchingLeadIds = matchingRows.map((row) => row.leadId);

      numberFilterConditions.push({
        id: {
          in: matchingLeadIds,
        },
      });
    }

    const filterConditions = [
      ...systemFilters,
      ...customFilters,
      ...numberFilterConditions,
    ];

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
