import type { Db } from "../db";
import { buildInFilters } from "../filters";
import { COLUMN_BY_FIELD, SELECT_COLUMNS } from "./repository";
import type { Employee, ListQuery, Page } from "./types";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

export function listEmployees(db: Db, query: ListQuery = {}): Page<Employee> {
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.trunc(query.pageSize ?? DEFAULT_PAGE_SIZE)));
  const page = Math.max(1, Math.trunc(query.page ?? 1));

  const conditions: string[] = [];
  const params: Record<string, string | number> = {};

  const search = query.search?.trim();
  if (search) {
    params.search = `%${escapeLike(search)}%`;
    conditions.push(
      `(first_name LIKE @search ESCAPE '\\'
        OR last_name LIKE @search ESCAPE '\\'
        OR email LIKE @search ESCAPE '\\'
        OR (first_name || ' ' || last_name) LIKE @search ESCAPE '\\')`
    );
  }

     const filters = buildInFilters([
     { column: "country", values: query.country },
     { column: "department", values: query.department },
     { column: "job_title", values: query.jobTitle },
   ]);
   conditions.push(...filters.conditions);
   Object.assign(params, filters.params);

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const total = (
    db.prepare(`SELECT COUNT(*) AS c FROM employees ${where}`).get(params) as { c: number }
  ).c;

  const sortBy = query.sortBy ?? "id";
  const sortColumn = sortBy === "id" ? "id" : COLUMN_BY_FIELD[sortBy];
  const direction = query.sortDir === "desc" ? "DESC" : "ASC";

  const items = db
    .prepare(
      `SELECT ${SELECT_COLUMNS} FROM employees ${where}
       ORDER BY ${sortColumn} ${direction}, id ASC
       LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit: pageSize, offset: (page - 1) * pageSize }) as Employee[];

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}