import type { Db } from "../db";

export interface Options {
  countries: string[];
  departments: string[];
  jobTitles: string[];
}

// The column argument is a literal union, so nothing user-supplied reaches the SQL.
function distinct(db: Db, column: "country" | "department" | "job_title"): string[] {
  const rows = db
    .prepare(`SELECT DISTINCT ${column} AS value FROM employees ORDER BY value`)
    .all() as { value: string }[];
  return rows.map((row) => row.value);
}

export function listOptions(db: Db): Options {
  return {
    countries: distinct(db, "country"),
    departments: distinct(db, "department"),
    jobTitles: distinct(db, "job_title"),
  };
}