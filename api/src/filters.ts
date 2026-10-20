// Only these literal column names are ever interpolated into SQL.
export type FilterColumn = "country" | "department" | "job_title";

export interface ColumnFilter {
  column: FilterColumn;
  values?: string[];
}

export function buildInFilters(filters: ColumnFilter[]): {
  conditions: string[];
  params: Record<string, string>;
} {
  const conditions: string[] = [];
  const params: Record<string, string> = {};

  for (const { column, values } of filters) {
    const unique = [...new Set((values ?? []).filter(Boolean))];
    if (unique.length === 0) continue;

    const names = unique.map((value, index) => {
      const name = `${column}_${index}`;
      params[name] = value;
      return `@${name}`;
    });
    conditions.push(`${column} IN (${names.join(", ")})`);
  }
  return { conditions, params };
}