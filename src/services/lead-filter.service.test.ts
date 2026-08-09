import { describe, expect, it } from "vitest";
import { buildCustomFilters } from "./lead-filter.service";

describe("buildCustomFilters", () => {
  it("should build a custom string contains filter", () => {
    const filters = [
      {
        fieldId: "city-field-id",
        fieldType: "string" as const,
        condition: "contain" as const,
        value: "Kochi",
      },
    ];

    const result = buildCustomFilters(filters);

    expect(result).toEqual([
      {
        customValues: {
          some: {
            fieldId: "city-field-id",
            value: {
              contains: "Kochi",
              mode: "insensitive",
            },
          },
        },
      },
    ]);
  });
  it("should build a custom string is not filter", () => {
    const filters = [
      {
        fieldId: "city-field-id",
        fieldType: "string" as const,
        condition: "is not" as const,
        value: "Kochi",
      },
    ];

    const result = buildCustomFilters(filters);

    expect(result).toEqual([
      {
        customValues: {
          none: {
            fieldId: "city-field-id",
            value: {
              equals: "Kochi",
              mode: "insensitive",
            },
          },
        },
      },
    ]);
  });
  it("should build a custom string is empty filter", () => {
    const filters = [
      {
        fieldId: "city-field-id",
        fieldType: "string" as const,
        condition: "is empty" as const,
      },
    ];

    const result = buildCustomFilters(filters);

    expect(result).toEqual([
      {
        customValues: {
          none: {
            fieldId: "city-field-id",
          },
        },
      },
    ]);
  });

  it("should build a custom string is filter", () => {
    const filters = [
      {
        fieldId: "city-field-id",
        fieldType: "string" as const,
        condition: "is" as const,
        value: "Kochi",
      },
    ];

    const result = buildCustomFilters(filters);

    expect(result).toEqual([
      {
        customValues: {
          some: {
            fieldId: "city-field-id",
            value: {
              equals: "Kochi",
              mode: "insensitive",
            },
          },
        },
      },
    ]);
  });
  it("should build a custom string is not empty filter", () => {
    const filters = [
      {
        fieldId: "city-field-id",
        fieldType: "string" as const,
        condition: "is not empty" as const,
      },
    ];

    const result = buildCustomFilters(filters);

    expect(result).toEqual([
      {
        customValues: {
          some: {
            fieldId: "city-field-id",
          },
        },
      },
    ]);
  });
  it("should build a custom string starts with filter", () => {
    const filters = [
      {
        fieldId: "city-field-id",
        fieldType: "string" as const,
        condition: "starts with" as const,
        value: "Tri",
      },
    ];

    const result = buildCustomFilters(filters);

    expect(result).toEqual([
      {
        customValues: {
          some: {
            fieldId: "city-field-id",
            value: {
              startsWith: "Tri",
              mode: "insensitive",
            },
          },
        },
      },
    ]);
  });
  it("should build a custom string ends with filter", () => {
    const filters = [
      {
        fieldId: "city-field-id",
        fieldType: "string" as const,
        condition: "ends with" as const,
        value: "chi",
      },
    ];

    const result = buildCustomFilters(filters);

    expect(result).toEqual([
      {
        customValues: {
          some: {
            fieldId: "city-field-id",
            value: {
              endsWith: "chi",
              mode: "insensitive",
            },
          },
        },
      },
    ]);
  });
  it("should build a custom string does not contain filter", () => {
    const filters = [
      {
        fieldId: "city-field-id",
        fieldType: "string" as const,
        condition: "does not contain" as const,
        value: "Kochi",
      },
    ];

    const result = buildCustomFilters(filters);

    expect(result).toEqual([
      {
        customValues: {
          none: {
            fieldId: "city-field-id",
            value: {
              contains: "Kochi",
              mode: "insensitive",
            },
          },
        },
      },
    ]);
  });
  it("should throw when custom string filter value is missing", () => {
    const filters = [
      {
        fieldId: "city-field-id",
        fieldType: "string" as const,
        condition: "contain" as const,
      },
    ];

    expect(() => buildCustomFilters(filters)).toThrow(
      "Value is required for custom field 'city-field-id'",
    );
  });
});
