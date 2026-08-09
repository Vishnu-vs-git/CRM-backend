import { BadRequestError } from "../errors/app.error";
import type { LeadQueryInput } from "../validators/lead-query.schema";

export const SYSTEM_FIELDS = [
  "name",
  "phone",
  "email",
  "assignedTo",
  "followUpDate",
  "createdAt",
  "updatedAt",
  "createdBy",
] as const;

export type SystemField = (typeof SYSTEM_FIELDS)[number];

/**
 * Builds Prisma dynamic condition blocks for system fields.
 * Filters out any non-system custom fields and delegates sub-builders based on data type.
 *
 * @param filters Array of LeadFilter inputs from the request body.
 * @returns An array of Prisma search clauses for system fields.
 */
export function buildSystemFilters(filters: LeadQueryInput["filters"]) {
  const conditions = [];

  for (const filter of filters) {
    if (!SYSTEM_FIELDS.includes(filter.fieldId as SystemField)) {
      continue;
    }

    if (filter.fieldId === "createdBy") {
      conditions.push(buildCreatedByCondition(filter));
      continue;
    }

    if (filter.fieldId === "assignedTo") {
      conditions.push(buildAssignedToCondition(filter));
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
/**
 * Builds Prisma dynamic relation condition blocks for custom string fields stored via EAV.
 * Filters out system columns and non-string types, compiling conditions into `some` / `none` relation checks.
 *
 * @param filters Array of LeadFilter inputs from the request body.
 * @returns An array of Prisma search clauses for custom EAV string fields.
 */
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
export function getBooleanFilters(filters: LeadQueryInput["filters"]) {
  return filters.filter(
    (filter) =>
      !SYSTEM_FIELDS.includes(filter.fieldId as SystemField) &&
      filter.fieldType === "boolean",
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
  switch (filter.condition) {
    case "is empty":
      return {
        OR: [
          {
            [filter.fieldId]: null,
          },
          {
            [filter.fieldId]: "",
          },
        ],
      };

    case "is not empty":
      return {
        AND: [
          {
            [filter.fieldId]: {
              not: null,
            },
          },
          {
            [filter.fieldId]: {
              not: "",
            },
          },
        ],
      };
  }

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
          mode: "insensitive" as const,
        },
      };

    case "is not":
      if (filter.fieldId === "name") {
        return {
          NOT: {
            name: {
              equals: filter.value,
              mode: "insensitive" as const,
            },
          },
        };
      }
      return {
        OR: [
          {
            [filter.fieldId]: null,
          },
          {
            NOT: {
              [filter.fieldId]: {
                equals: filter.value,
                mode: "insensitive" as const,
              },
            },
          },
        ],
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

    case "ends with":
      return {
        [filter.fieldId]: {
          endsWith: filter.value,
          mode: "insensitive" as const,
        },
      };

    case "does not contain":
      if (filter.fieldId === "name") {
        return {
          NOT: {
            name: {
              contains: filter.value,
              mode: "insensitive" as const,
            },
          },
        };
      }
      return {
        OR: [
          {
            [filter.fieldId]: null,
          },
          {
            NOT: {
              [filter.fieldId]: {
                contains: filter.value,
                mode: "insensitive" as const,
              },
            },
          },
        ],
      };

    default:
      throw new BadRequestError(
        `Condition '${filter.condition}' is not supported for string field '${filter.fieldId}'`,
      );
  }
}
function buildDateCondition(filter: LeadQueryInput["filters"][number]) {
  if (filter.condition === "is empty") {
    return {
      [filter.fieldId]: null,
    };
  }

  if (filter.condition === "is not empty") {
    return {
      [filter.fieldId]: {
        not: null,
      },
    };
  }

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
function buildCreatedByCondition(filter: LeadQueryInput["filters"][number]) {
  if (filter.fieldType !== "string") {
    throw new BadRequestError(`createdBy must use string field type`);
  }

  if (filter.condition === "is empty" || filter.condition === "is not empty") {
    throw new BadRequestError(
      `Condition '${filter.condition}' is not supported for createdBy`,
    );
  }

  if (filter.value === undefined) {
    throw new BadRequestError(`Value is required for system field 'createdBy'`);
  }

  const values = filter.value
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (values.length === 0) {
    throw new BadRequestError(`Value is required for system field 'createdBy'`);
  }

  switch (filter.condition) {
    case "is":
    case "contain":
      return {
        userId: {
          in: values,
        },
      };

    case "is not":
    case "does not contain":
      return {
        userId: {
          notIn: values,
        },
      };

    default:
      throw new BadRequestError(
        `Condition '${filter.condition}' is not supported for createdBy`,
      );
  }
}

function buildAssignedToCondition(filter: LeadQueryInput["filters"][number]) {
  switch (filter.condition) {
    case "is":
    case "contain": {
      if (filter.value === undefined) {
        throw new BadRequestError(
          `Value is required for system field 'assignedTo'`,
        );
      }

      const values = filter.value
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      if (values.length === 0) {
        throw new BadRequestError(
          `Value is required for system field 'assignedTo'`,
        );
      }

      return {
        assignedTo: {
          in: values,
        },
      };
    }

    case "is not":
    case "does not contain": {
      if (filter.value === undefined) {
        throw new BadRequestError(
          `Value is required for system field 'assignedTo'`,
        );
      }

      const values = filter.value
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      if (values.length === 0) {
        throw new BadRequestError(
          `Value is required for system field 'assignedTo'`,
        );
      }

      return {
        OR: [
          {
            assignedTo: null,
          },
          {
            assignedTo: {
              notIn: values,
            },
          },
        ],
      };
    }

    case "is empty":
      return {
        assignedTo: null,
      };

    case "is not empty":
      return {
        assignedTo: {
          not: null,
        },
      };

    default:
      throw new BadRequestError(
        `Condition '${filter.condition}' is not supported for assignedTo`,
      );
  }
}
