import { z } from "zod";
import { multiText, validate, type ValidationResult } from "../employees/validation";
import type { SalaryStatsQuery } from "./salaryStats";

const salaryStatsQuerySchema = z.object({
  groupBy: z.enum(["country", "department", "jobTitle"]).default("country"),
  country: multiText,
  department: multiText,
  jobTitle: multiText,
});

export function validateSalaryStatsQuery(input: unknown): ValidationResult<SalaryStatsQuery> {
  return validate(salaryStatsQuerySchema, input);
}