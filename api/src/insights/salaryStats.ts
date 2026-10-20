import type { Db } from "../db";
import { buildInFilters } from "../filters";

// Whitelist: only these column names are ever interpolated into SQL.
export const GROUP_COLUMNS = {
  country: "country",
  department: "department",
  jobTitle: "job_title",
} as const;

export type GroupBy = keyof typeof GROUP_COLUMNS;

export interface SalaryStatsQuery {
  groupBy: GroupBy;
  country?: string[];
  department?: string[];
  jobTitle?: string[];
}

export interface SalaryStatsRow {
  group: string;
  currency: string;
  headcount: number;
  min: number;
  max: number;
  average: number;
  median: number;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

export function salaryStats(db: Db, query: SalaryStatsQuery): SalaryStatsRow[] {
  const groupColumn = GROUP_COLUMNS[query.groupBy];

  const { conditions, params } = buildInFilters([
     { column: "country", values: query.country },
     { column: "department", values: query.department },
     { column: "job_title", values: query.jobTitle },
   ]);
   const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
   
  // Median: rank salaries within each (group, currency), then average the middle
  // one (odd count) or two (even count) ranks. (cnt+1)/2 and (cnt+2)/2 are integer
  // divisions: for cnt=5 both are 3, for cnt=4 they are 2 and 3.
  const rows = db
    .prepare(
      `WITH ranked AS (
         SELECT ${groupColumn} AS grp, currency, salary,
                ROW_NUMBER() OVER (PARTITION BY ${groupColumn}, currency ORDER BY salary) AS rn,
                COUNT(*) OVER (PARTITION BY ${groupColumn}, currency) AS cnt
         FROM employees
         ${where}
       )
       SELECT grp AS "group", currency,
              COUNT(*) AS headcount,
              MIN(salary) AS min,
              MAX(salary) AS max,
              AVG(salary) AS average,
              AVG(CASE WHEN rn IN ((cnt + 1) / 2, (cnt + 2) / 2) THEN salary END) AS median
       FROM ranked
       GROUP BY grp, currency
       ORDER BY grp, currency`
    )
    .all(params) as SalaryStatsRow[];

  return rows.map((row) => ({
    ...row,
    average: round2(row.average),
    median: round2(row.median),
  }));
}