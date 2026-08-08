import { BadRequestError } from "../errors/app.error";
import type { LeadQueryInput } from "../validators/lead-query.schema";

const SYSTEM_FIELDS = ["name", "email", "assignedTo", "followUpDate"] as const;

type SystemField = (typeof SYSTEM_FIELDS)[number];

export function buildSystemFilters(filters: LeadQueryInput["filters"]) {
  const conditions = [];

  for (const filter of filters) {
    if (!SYSTEM_FIELDS.includes(filter.field as SystemField)) {
      continue;
    }

    switch (filter.field) {
      case "name":
        conditions.push(buildStringCondition("name", filter));
        break;

      case "email":
        conditions.push(buildStringCondition("email", filter));
        break;

      case "assignedTo":
        conditions.push(buildStringCondition("assignedTo", filter));
        break;

      case "followUpDate":
        conditions.push(buildDateCondition("followUpDate", filter));
        break;
    }
  }

  return conditions;
}

function buildStringCondition(
  field: string,
  filter: LeadQueryInput["filters"][number],
) {
  switch (filter.operator) {
    case "eq":
      return {
        [field]: {
          equals: filter.value as string,
        },
      };

    case "neq":
      return {
        [field]: {
          not: filter.value as string,
        },
      };

    case "contains":
      return {
        [field]: {
          contains: filter.value as string,
          mode: "insensitive" as const,
        },
      };

    case "startsWith":
      return {
        [field]: {
          startsWith: filter.value as string,
          mode: "insensitive" as const,
        },
      };

    default:
      throw new BadRequestError(
        `Operator ${filter.operator} is not supported for ${field}`,
      );
  }
}

function buildDateCondition(
  field: string,
  filter: LeadQueryInput["filters"][number],
) {
  const date = new Date(filter.value as string);

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestError("Invalid followUpDate");
  }

  switch (filter.operator) {
    case "eq":
      return {
        [field]: {
          equals: date,
        },
      };

    case "neq":
      return {
        [field]: {
          not: date,
        },
      };

    case "gt":
      return {
        [field]: {
          gt: date,
        },
      };

    case "gte":
      return {
        [field]: {
          gte: date,
        },
      };

    case "lt":
      return {
        [field]: {
          lt: date,
        },
      };

    case "lte":
      return {
        [field]: {
          lte: date,
        },
      };

    default:
      throw new BadRequestError(
        `Operator ${filter.operator} is not supported for ${field}`,
      );
  }
}
