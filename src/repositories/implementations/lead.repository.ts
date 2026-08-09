import { BadRequestError } from "../../errors/app.error";
import type { PrismaClient } from "../../generated/prisma/client";
import {
  buildCustomFilters,
  buildSystemFilters,
  getBooleanFilters,
  getDateFilters,
  getNumberFilters,
  SYSTEM_FIELDS,
} from "../../services/lead-filter.service";
import type { AuthContext } from "../../types/auth.types";
import type { FieldIdResult } from "../../types/fieldId-result.type";
import type { LeadQueryResult } from "../../types/lead-query.result.types";
import type { LeadQueryInput } from "../../validators/lead-query.schema";
import type { ILeadRepository } from "../interfaces/lead.repository.interface";

export class LeadRepository implements ILeadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Queries, filters, and paginates leads for the authenticated tenant.
   * Combines system column filters, custom EAV attributes filters, and free-text search.
   * Applies role-based visibility scoping and eager-loads relationship values (prevents N+1).
   *
   * @param query Validated query input parameters and filters.
   * @param auth Authenticated user context containing tenant and role boundaries.
   * @returns A promise resolving to the hydrated lead results and pagination metadata.
   */
  async queryLeads(
    query: LeadQueryInput,
    auth: AuthContext,
  ): Promise<LeadQueryResult> {
    const fieldIds = [
      ...new Set(query.filters.map((filter) => filter.fieldId)),
    ];
    const customFieldIds = fieldIds.filter(
      (id) => !(SYSTEM_FIELDS as readonly string[]).includes(id),
    );

    if (customFieldIds.length > 0) {
      const fields = await this.findByIds(customFieldIds, auth.tenantId);

      const existingFieldIds = new Set(fields.map((field) => field.id));

      const invalidFieldId = customFieldIds.find(
        (id) => !existingFieldIds.has(id),
      );

      if (invalidFieldId) {
        throw new BadRequestError(`Invalid fieldId: ${invalidFieldId}`);
      }
    }

    const systemFilters = buildSystemFilters(query.filters);
    const customFilters = buildCustomFilters(query.filters);

    const numberFilters = getNumberFilters(query.filters);

    const numberFilterConditions = [];

    for (const filter of numberFilters) {
      if (filter.condition === "is empty") {
        const matchingRows = await this.prisma.$queryRaw<{ leadId: string }[]>`
          SELECT "leadId"
          FROM "lead_custom_field_values"
          WHERE "fieldId" = ${filter.fieldId}::uuid
        `;

        const idsWithValue = matchingRows.map((row) => row.leadId);

        numberFilterConditions.push({
          id: {
            notIn: idsWithValue,
          },
        });

        continue;
      }

      if (filter.condition === "is not empty") {
        const matchingRows = await this.prisma.$queryRaw<{ leadId: string }[]>`
          SELECT "leadId"
          FROM "lead_custom_field_values"
          WHERE "fieldId" = ${filter.fieldId}::uuid
        `;

        const idsWithValue = matchingRows.map((row) => row.leadId);

        numberFilterConditions.push({
          id: {
            in: idsWithValue,
          },
        });

        continue;
      }

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

      const matchingLeadIds = await this.findNumberFilterLeadIds(
        filter.fieldId,
        filter.condition,
        numericValue,
      );

      numberFilterConditions.push({
        id: {
          in: matchingLeadIds,
        },
      });
    }

    const dateFilters = getDateFilters(query.filters);
    const dateFilterConditions = [];

    for (const filter of dateFilters) {
      if (filter.condition === "is empty") {
        const matchingRows = await this.prisma.$queryRaw<{ leadId: string }[]>`
      SELECT "leadId"
      FROM "lead_custom_field_values"
      WHERE "fieldId" = ${filter.fieldId}::uuid
    `;

        const idsWithValue = matchingRows.map((row) => row.leadId);

        dateFilterConditions.push({
          id: {
            notIn: idsWithValue,
          },
        });

        continue;
      }

      if (filter.condition === "is not empty") {
        const matchingRows = await this.prisma.$queryRaw<{ leadId: string }[]>`
      SELECT "leadId"
      FROM "lead_custom_field_values"
      WHERE "fieldId" = ${filter.fieldId}::uuid
    `;

        const idsWithValue = matchingRows.map((row) => row.leadId);

        dateFilterConditions.push({
          id: {
            in: idsWithValue,
          },
        });

        continue;
      }

      if (filter.value === undefined) {
        throw new BadRequestError(
          `Value is required for custom field '${filter.fieldId}'`,
        );
      }

      const dateValue = new Date(filter.value);

      if (Number.isNaN(dateValue.getTime())) {
        throw new BadRequestError(
          `Invalid date value for custom field '${filter.fieldId}'`,
        );
      }

      let matchingRows: { leadId: string }[];

      switch (filter.condition) {
        case "is":
          matchingRows = await this.prisma.$queryRaw<{ leadId: string }[]>`
        SELECT "leadId"
        FROM "lead_custom_field_values"
        WHERE "fieldId" = ${filter.fieldId}::uuid
          AND "value" ~ '^\\d{4}-\\d{2}-\\d{2}$'
          AND "value"::date = ${dateValue}
      `;
          break;

        case "is not":
          matchingRows = await this.prisma.$queryRaw<{ leadId: string }[]>`
        SELECT "leadId"
        FROM "lead_custom_field_values"
        WHERE "fieldId" = ${filter.fieldId}::uuid
          AND "value" ~ '^\\d{4}-\\d{2}-\\d{2}$'
          AND "value"::date != ${dateValue}
      `;
          break;

        case "before":
          matchingRows = await this.prisma.$queryRaw<{ leadId: string }[]>`
        SELECT "leadId"
        FROM "lead_custom_field_values"
        WHERE "fieldId" = ${filter.fieldId}::uuid
          AND "value" ~ '^\\d{4}-\\d{2}-\\d{2}$'
          AND "value"::date < ${dateValue}
      `;
          break;

        case "after":
          matchingRows = await this.prisma.$queryRaw<{ leadId: string }[]>`
        SELECT "leadId"
        FROM "lead_custom_field_values"
        WHERE "fieldId" = ${filter.fieldId}::uuid
          AND "value" ~ '^\\d{4}-\\d{2}-\\d{2}$'
          AND "value"::date > ${dateValue}
      `;
          break;

        default:
          throw new BadRequestError(
            `Condition '${filter.condition}' is not supported for date field '${filter.fieldId}'`,
          );
      }

      dateFilterConditions.push({
        id: {
          in: matchingRows.map((row) => row.leadId),
        },
      });
    }

    const booleanFilters = getBooleanFilters(query.filters);
    const booleanFilterConditions = [];

    for (const filter of booleanFilters) {
      if (filter.value === undefined) {
        throw new BadRequestError(
          `Value is required for custom field '${filter.fieldId}'`,
        );
      }

      if (filter.value !== "true" && filter.value !== "false") {
        throw new BadRequestError(
          `Invalid boolean value for custom field '${filter.fieldId}'`,
        );
      }

      const booleanValue = filter.value === "true";

      let matchingRows: { leadId: string }[];

      switch (filter.condition) {
        case "is":
          matchingRows = await this.prisma.$queryRaw<{ leadId: string }[]>`
        SELECT "leadId"
        FROM "lead_custom_field_values"
        WHERE "fieldId" = ${filter.fieldId}::uuid
          AND "value" IN ('true', 'false')
          AND "value"::boolean = ${booleanValue}
      `;
          break;

        case "is not":
          matchingRows = await this.prisma.$queryRaw<{ leadId: string }[]>`
        SELECT "leadId"
        FROM "lead_custom_field_values"
        WHERE "fieldId" = ${filter.fieldId}::uuid
          AND "value" IN ('true', 'false')
          AND "value"::boolean != ${booleanValue}
      `;
          break;

        default:
          throw new BadRequestError(
            `Condition '${filter.condition}' is not supported for boolean field '${filter.fieldId}'`,
          );
      }

      booleanFilterConditions.push({
        id: {
          in: matchingRows.map((row) => row.leadId),
        },
      });
    }

    const filterConditions = [
      ...systemFilters,
      ...customFilters,
      ...numberFilterConditions,
      ...dateFilterConditions,
      ...booleanFilterConditions,
    ];

    const searchCondition = query.q
      ? {
          OR: [
            {
              name: {
                contains: query.q,
                mode: "insensitive" as const,
              },
            },
            {
              phone: {
                contains: query.q,
                mode: "insensitive" as const,
              },
            },
            {
              email: {
                contains: query.q,
                mode: "insensitive" as const,
              },
            },
            {
              e164: {
                contains: query.q,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {};

    const where = {
      tenantId: auth.tenantId,

      ...(auth.role === "AGENT"
        ? {
            assignedTo: auth.userId,
          }
        : {}),

      ...(query.q ? searchCondition : {}),

      ...(filterConditions.length > 0
        ? query.logic === "AND"
          ? { AND: filterConditions }
          : { OR: filterConditions }
        : {}),
    };

    const leads = await this.prisma.lead.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: {
        [query.sortBy]:
          query.sortBy === "followUpDate"
            ? { sort: query.sortDirection, nulls: "last" }
            : query.sortDirection,
      },
      include: {
        customValues: {
          select: {
            fieldId: true,
            value: true,
            field: {
              select: {
                label: true,
                type: true,
              },
            },
          },
        },
      },
    });

    const total = await this.prisma.lead.count({
      where,
    });

    return {
      leads: leads.map((lead) => {
        const { customValues, ...leadData } = lead;

        return {
          ...leadData,
          customFields: customValues.map((customValue) => ({
            fieldId: customValue.fieldId,
            label: customValue.field.label,
            type: customValue.field.type,
            value: customValue.value,
          })),
        };
      }),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  /**
   * Validates existence and active status of custom fields within a specific tenant.
   * Prevents cross-tenant injection of metadata fields during filtering.
   *
   * @param fieldIds Array of custom field UUIDs to validate.
   * @param tenantId UUID of the calling tenant.
   * @returns List of matching active custom field IDs.
   */
  async findByIds(
    fieldIds: string[],
    tenantId: string,
  ): Promise<FieldIdResult[]> {
    return this.prisma.customField.findMany({
      where: {
        tenantId,
        status: "ACTIVE",
        id: {
          in: fieldIds,
        },
      },
      select: {
        id: true,
      },
    });
  }
  /**
   * Helper that executes parameterized SQL checks with type-casting safety for custom numbers.
   * Performs regex checks on the text column first to prevent PostgreSQL engine cast failures on mixed EAV values.
   *
   * @param fieldId Custom field UUID.
   * @param condition Filter matching condition (is, is not, greater than, less than).
   * @param value Parsed numeric target value.
   * @returns Array of lead UUIDs matching the condition.
   */
  private async findNumberFilterLeadIds(
    fieldId: string,
    condition: string,
    value: number,
  ): Promise<string[]> {
    switch (condition) {
      case "is": {
        const rows = await this.prisma.$queryRaw<{ leadId: string }[]>`
        SELECT "leadId"
        FROM "lead_custom_field_values"
        WHERE "fieldId" = ${fieldId}::uuid
          AND "value" ~ '^-?[0-9]+(\\.[0-9]+)?$'
          AND "value"::numeric = ${value}
      `;

        return rows.map((row) => row.leadId);
      }

      case "is not": {
        const rows = await this.prisma.$queryRaw<{ leadId: string }[]>`
        SELECT "leadId"
        FROM "lead_custom_field_values"
        WHERE "fieldId" = ${fieldId}::uuid
          AND "value" ~ '^-?[0-9]+(\\.[0-9]+)?$'
          AND "value"::numeric != ${value}
      `;

        return rows.map((row) => row.leadId);
      }

      case "greater than": {
        const rows = await this.prisma.$queryRaw<{ leadId: string }[]>`
        SELECT "leadId"
        FROM "lead_custom_field_values"
        WHERE "fieldId" = ${fieldId}::uuid
          AND "value" ~ '^-?[0-9]+(\\.[0-9]+)?$'
          AND "value"::numeric > ${value}
      `;

        return rows.map((row) => row.leadId);
      }

      case "less than": {
        const rows = await this.prisma.$queryRaw<{ leadId: string }[]>`
        SELECT "leadId"
        FROM "lead_custom_field_values"
        WHERE "fieldId" = ${fieldId}::uuid
          AND "value" ~ '^-?[0-9]+(\\.[0-9]+)?$'
          AND "value"::numeric < ${value}
      `;

        return rows.map((row) => row.leadId);
      }

      default:
        throw new BadRequestError(
          `Condition '${condition}' is not supported for number field '${fieldId}'`,
        );
    }
  }
}
