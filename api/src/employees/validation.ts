import { z } from "zod";
import { SORT_FIELDS, type EmployeeInput, type ListQuery } from "./types";

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: { field: string; message: string }[] };

function isRealDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const text = z.string().trim().min(1).max(100);

const employeeInputSchema = z.object({
  firstName: text,
  lastName: text,
  email: z.string().trim().toLowerCase().email().max(200),
  jobTitle: text,
  department: text,
  country: text,
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "must be a 3-letter currency code"),
  salary: z.number().int().nonnegative(),
  hireDate: z.string().refine(isRealDate, "must be a valid date in YYYY-MM-DD format"),
});

const employeeUpdateSchema = employeeInputSchema.partial();

const optionalText = z.string().trim().optional();

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  search: optionalText,
  country: optionalText,
  department: optionalText,
  jobTitle: optionalText,
  sortBy: z.enum(SORT_FIELDS).default("id"),
  sortDir: z.enum(["asc", "desc"]).default("asc"),
});

function validate<S extends z.ZodType>(schema: S, input: unknown): ValidationResult<z.infer<S>> {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  return {
    ok: false,
    errors: result.error.issues.map((issue) => ({
      field: issue.path.map(String).join("."),
      message: issue.message,
    })),
  };
}

export function validateEmployeeInput(input: unknown): ValidationResult<EmployeeInput> {
  return validate(employeeInputSchema, input);
}

export function validateEmployeeUpdate(input: unknown): ValidationResult<Partial<EmployeeInput>> {
  const result = validate(employeeUpdateSchema, input);
  if (result.ok && Object.keys(result.data).length === 0) {
    return { ok: false, errors: [{ field: "", message: "provide at least one field to update" }] };
  }
  return result;
}

export function validateListQuery(input: unknown): ValidationResult<ListQuery> {
  return validate(listQuerySchema, input);
}