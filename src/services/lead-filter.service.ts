import { BadRequestError } from "../errors/app.error";
import type { LeadQueryInput } from "../validators/lead-query.schema";

const SYSTEM_FIELDS = [
  "name",
  "phone",
  "email",
  "assignedTo",
  "followUpDate",
  "createdAt",
  "updatedAt",
] as const;

type SystemField = (typeof SYSTEM_FIELDS)[number];

export function buildSystemFilters(filters: LeadQueryInput["filters"]) {
  const conditions = [];

  for (const filter of filters) {
    if (!SYSTEM_FIELDS.includes(filter.fieldId as SystemField)) {
      continue;
    }

    switch (filter.fieldType) {
      case "string":
        conditions.push(buildStringCondition(filter));
        break;

      case "date":
        conditions.push(buildDateCondition(filter));
        break;

      default:
        throw new BadRequestError(
          `Unsupported field type '${filter.fieldType}' for system field '${filter.fieldId}'`,
        );
    }
  }

  return conditions;
}
export function buildCustomFilters(filters: LeadQueryInput["filters"]) {
  const conditions = [];

  for (const filter of filters) {
    if (SYSTEM_FIELDS.includes(filter.fieldId as SystemField)) {
      continue;
    }

    if (filter.fieldType !== "string") {
      continue;
    }

    switch (filter.condition) {
      case "contain":
        if (filter.value === undefined) {
          throw new BadRequestError(
            `Value is required for custom field '${filter.fieldId}'`,
          );
        }
        conditions.push({
          customValues: {
            some: {
              fieldId: filter.fieldId,
              value: {
                contains: filter.value,
                mode: "insensitive" as const,
              },
            },
          },
        });
        break;

      case "is":
        if (filter.value === undefined) {
          throw new BadRequestError(
            `Value is required for custom field '${filter.fieldId}'`,
          );
        }
        conditions.push({
          customValues: {
            some: {
              fieldId: filter.fieldId,
              value: {
                equals: filter.value,
                mode: "insensitive" as const,
              },
            },
          },
        });
        break;

      case "is not":
        if (filter.value === undefined) {
          throw new BadRequestError(
            `Value is required for custom field '${filter.fieldId}'`,
          );
        }
        conditions.push({
          customValues: {
            none: {
              fieldId: filter.fieldId,
              value: {
                equals: filter.value,
                mode: "insensitive" as const,
              },
            },
          },
        });
        break;
      case "does not contain":
        if (filter.value === undefined) {
          throw new BadRequestError(
            `Value is required for custom field '${filter.fieldId}'`,
          );
        }
        conditions.push({
          customValues: {
            none: {
              fieldId: filter.fieldId,
              value: {
                contains: filter.value,
                mode: "insensitive" as const,
              },
            },
          },
        });
        break;
      case "starts with":
        if (filter.value === undefined) {
          throw new BadRequestError(
            `Value is required for custom field '${filter.fieldId}'`,
          );
        }
        conditions.push({
          customValues: {
            some: {
              fieldId: filter.fieldId,
              value: {
                startsWith: filter.value,
                mode: "insensitive" as const,
              },
            },
          },
        });
        break;
      case "ends with":
        if (filter.value === undefined) {
          throw new BadRequestError(
            `Value is required for custom field '${filter.fieldId}'`,
          );
        }
        conditions.push({
          customValues: {
            some: {
              fieldId: filter.fieldId,
              value: {
                endsWith: filter.value,
                mode: "insensitive" as const,
              },
            },
          },
        });
        break;
      case "is empty":
        conditions.push({
          customValues: {
            none: {
              fieldId: filter.fieldId,
            },
          },
        });
        break;
      case "is not empty":
        conditions.push({
          customValues: {
            some: {
              fieldId: filter.fieldId,
            },
          },
        });
        break;

      default:
        throw new BadRequestError(
          `Condition '${filter.condition}' is not supported for custom string fields`,
        );
    }
  }

  return conditions;
}

export function getNumberFilters(filters: LeadQueryInput["filters"]) {
  return filters.filter(
    (filter) =>
      !SYSTEM_FIELDS.includes(filter.fieldId as SystemField) &&
      filter.fieldType === "number",
  );
}

export function getDateFilters(filters: LeadQueryInput["filters"]) {
  return filters.filter(
    (filter) =>
      !SYSTEM_FIELDS.includes(filter.fieldId as SystemField) &&
      filter.fieldType === "date",
  );
}
function buildStringCondition(filter: LeadQueryInput["filters"][number]) {
  if (filter.value === undefined) {
    throw new BadRequestError(
      `Value is required for system field '${filter.fieldId}'`,
    );
  }

  switch (filter.condition) {
    case "is":
      return {
        [filter.fieldId]: {
          equals: filter.value,
        },
      };

    case "is not":
      return {
        [filter.fieldId]: {
          not: filter.value,
        },
      };

    case "contain":
      return {
        [filter.fieldId]: {
          contains: filter.value,
          mode: "insensitive" as const,
        },
      };

    case "starts with":
      return {
        [filter.fieldId]: {
          startsWith: filter.value,
          mode: "insensitive" as const,
        },
      };

    default:
      throw new BadRequestError(
        `Condition '${filter.condition}' is not supported for string field '${filter.fieldId}'`,
      );
  }
}
function buildDateCondition(filter: LeadQueryInput["filters"][number]) {
  if (!filter.value) {
    throw new BadRequestError(`Value is required for ${filter.condition}`);
  }

  const date = new Date(filter.value);

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestError(`Invalid date value for '${filter.fieldId}'`);
  }

  switch (filter.condition) {
    case "is":
      return {
        [filter.fieldId]: {
          equals: date,
        },
      };

    case "is not":
      return {
        [filter.fieldId]: {
          not: date,
        },
      };

    case "before":
      return {
        [filter.fieldId]: {
          lt: date,
        },
      };

    case "after":
      return {
        [filter.fieldId]: {
          gt: date,
        },
      };

    default:
      throw new BadRequestError(
        `Condition '${filter.condition}' is not supported for date field '${filter.fieldId}'`,
      );
  }
}
