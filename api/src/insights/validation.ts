import { z } from "zod";
import { multiText, validate, type ValidationResult } from "../employees/validation";
import type { SalaryStatsQuery } from "./salaryStats";

const optionalText = z.string().trim().optional();

// Accepts nothing, ?country=India or ?country=India&country=Germany. Always yields string[].
// export const multiText = z.preprocess((value) => {
//   const items = value === undefined ? [] : Array.isArray(value) ? value : [value];
//   return items.filter((item) => typeof item !== "string" || item.trim() !== "");
// }, z.array(z.string().trim()).max(200));

const salaryStatsQuerySchema = z.object({
  groupBy: z.enum(["country", "department", "jobTitle"]).default("country"),
  country: multiText,
  department: multiText,
  jobTitle: multiText,
});

export function validateSalaryStatsQuery(input: unknown): ValidationResult<SalaryStatsQuery> {
  return validate(salaryStatsQuerySchema, input);
}