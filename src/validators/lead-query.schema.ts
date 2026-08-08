import { z } from "zod";

const operatorSchema = z.enum([
  "eq",
  "neq",
  "contains",
  "startsWith",
  "gt",
  "gte",
  "lt",
  "lte",
]);

const filterSchema = z.object({
  field: z.string().min(1),
  operator: operatorSchema,
  value: z.unknown(),
});
const sortSchema = z.object({
  field: z.string().min(1),
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
