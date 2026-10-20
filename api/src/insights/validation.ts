import { z } from "zod";
import { validate, type ValidationResult } from "../employees/validation";
import type { SalaryStatsQuery } from "./salaryStats";

const optionalText = z.string().trim().optional();

const salaryStatsQuerySchema = z.object({
  groupBy: z.enum(["country", "department", "jobTitle"]).default("country"),
  country: optionalText,
  department: optionalText,
  jobTitle: optionalText,
});

export function validateSalaryStatsQuery(input: unknown): ValidationResult<SalaryStatsQuery> {
  return validate(salaryStatsQuerySchema, input);
}