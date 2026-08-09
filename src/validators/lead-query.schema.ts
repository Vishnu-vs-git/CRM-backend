import { z } from "zod";

const filterConditionSchema = z.enum([
  "is",
  "is not",
  "contain",
  "starts with",
  "before",
  "after",
  "is empty",
  "is not empty",
  "greater than",
  "less than",
]);

const filterFieldTypeSchema = z.enum(["string", "number", "date", "boolean"]);

const filterSchema = z.object({
  fieldId: z.string().min(1),
  fieldType: filterFieldTypeSchema,
  condition: filterConditionSchema,
  value: z.string().optional(),
  inputType: z.enum(["text", "select", "multiselect"]).optional(),
});

const sortSchema = z.object({
  field: z.enum(["createdAt", "followUpDate"]),
  direction: z.enum(["asc", "desc"]),
});

export const leadQuerySchema = z.object({
  filters: z.array(filterSchema).default([]),

  logic: z.enum(["AND", "OR"]).default("AND"),

  q: z.string().trim().optional(),

  page: z.number().int().positive().default(1),

  limit: z.number().int().positive().max(100).default(10),

  sort: sortSchema.optional(),
});

export type LeadQueryInput = z.infer<typeof leadQuerySchema>;
