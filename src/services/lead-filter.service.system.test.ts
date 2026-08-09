import { describe, expect, it } from "vitest";
import { buildSystemFilters } from "./lead-filter.service";

describe("buildSystemFilters", () => {
  it("should build a system string is filter", () => {
    const filters = [
      {
        fieldId: "name",
        fieldType: "string" as const,
        condition: "is" as const,
        value: "Ram Kumar",
      },
    ];

    const result = buildSystemFilters(filters);

    expect(result).toEqual([
      {
        name: {
          equals: "Ram Kumar",
          mode: "insensitive",
        },
      },
    ]);
  });

  it("should build a system string contains filter", () => {
    const filters = [
      {
        fieldId: "name",
        fieldType: "string" as const,
        condition: "contain" as const,
        value: "Ram",
      },
    ];

    const result = buildSystemFilters(filters);

    expect(result).toEqual([
      {
        name: {
          contains: "Ram",
          mode: "insensitive",
        },
      },
    ]);
  });

  it("should build a system string starts with filter", () => {
    const filters = [
      {
        fieldId: "name",
        fieldType: "string" as const,
        condition: "starts with" as const,
        value: "Ram",
      },
    ];

    const result = buildSystemFilters(filters);

    expect(result).toEqual([
      {
        name: {
          startsWith: "Ram",
          mode: "insensitive",
        },
      },
    ]);
  });

  it("should build a system date before filter", () => {
    const filters = [
      {
        fieldId: "followUpDate",
        fieldType: "date" as const,
        condition: "before" as const,
        value: "2026-08-15",
      },
    ];

    const result = buildSystemFilters(filters);

    expect(result).toEqual([
      {
        followUpDate: {
          lt: new Date("2026-08-15"),
        },
      },
    ]);
  });

  it("should build a system date after filter", () => {
    const filters = [
      {
        fieldId: "followUpDate",
        fieldType: "date" as const,
        condition: "after" as const,
        value: "2026-08-10",
      },
    ];

    const result = buildSystemFilters(filters);

    expect(result).toEqual([
      {
        followUpDate: {
          gt: new Date("2026-08-10"),
        },
      },
    ]);
  });

  it("should reject an invalid date", () => {
    const filters = [
      {
        fieldId: "followUpDate",
        fieldType: "date" as const,
        condition: "before" as const,
        value: "invalid-date",
      },
    ];

    expect(() => buildSystemFilters(filters)).toThrow(
      "Invalid date value for 'followUpDate'",
    );
  });
});
