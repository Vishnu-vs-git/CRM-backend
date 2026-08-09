import { z } from "zod";

const filterConditionSchema = z.enum([
  "is",
  "is not",
  "contain",
  "starts with",
  "does not contain",
  "ends with",
  "before",
  "after",
  "is empty",
  "is not empty",
  "greater than",
  "less than",
]);

const filterFieldTypeSchema = z.enum(["string", "number", "date", "boolean"]);
const sortBySchema = z.enum(["createdAt", "followUpDate"]);
const sortDirectionSchema = z.enum(["asc", "desc"]);
const filterSchema = z.object({
  fieldId: z.string().min(1),
  fieldType: filterFieldTypeSchema,
  condition: filterConditionSchema,
  value: z.string().optional(),
  inputType: z.enum(["text", "select", "multiselect"]).optional(),
});

export const leadQuerySchema = z.object({
  filters: z.array(filterSchema).default([]),

  logic: z.enum(["AND", "OR"]).default("AND"),

  q: z.string().trim().optional(),

  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().positive().max(100).default(20),

  sortBy: sortBySchema.default("createdAt"),

  sortDirection: sortDirectionSchema.default("desc"),
});

export type LeadQueryInput = z.infer<typeof leadQuerySchema>;
