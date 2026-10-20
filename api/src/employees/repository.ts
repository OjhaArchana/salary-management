import type { Db } from "../db";
import type { Employee, EmployeeInput } from "./types";

export class DuplicateEmailError extends Error {
  constructor(email: string) {
    super(`An employee with email ${email} already exists`);
    this.name = "DuplicateEmailError";
  }
}

// Whitelist mapping API field names to DB columns. Dynamic SQL only ever uses these values.
export const COLUMN_BY_FIELD: Record<keyof EmployeeInput, string> = {
  firstName: "first_name",
  lastName: "last_name",
  email: "email",
  jobTitle: "job_title",
  department: "department",
  country: "country",
  currency: "currency",
  salary: "salary",
  hireDate: "hire_date",
};

// Aliases return camelCase objects straight from SQL.
export const SELECT_COLUMNS = `id, first_name AS firstName, last_name AS lastName, email,
  job_title AS jobTitle, department, country, currency, salary, hire_date AS hireDate`;

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: string }).code === "SQLITE_CONSTRAINT_UNIQUE"
  );
}

export function getEmployee(db: Db, id: number): Employee | undefined {
  return db.prepare(`SELECT ${SELECT_COLUMNS} FROM employees WHERE id = ?`).get(id) as
    | Employee
    | undefined;
}

export function createEmployee(db: Db, input: EmployeeInput): Employee {
  try {
    const info = db
      .prepare(
        `INSERT INTO employees
           (first_name, last_name, email, job_title, department, country, currency, salary, hire_date)
         VALUES
           (@firstName, @lastName, @email, @jobTitle, @department, @country, @currency, @salary, @hireDate)`
      )
      .run(input);
    return getEmployee(db, Number(info.lastInsertRowid)) as Employee;
  } catch (err) {
    if (isUniqueViolation(err)) throw new DuplicateEmailError(input.email);
    throw err;
  }
}

export function updateEmployee(
  db: Db,
  id: number,
  changes: Partial<EmployeeInput>
): Employee | undefined {
  const fields = (Object.keys(changes) as (keyof EmployeeInput)[]).filter(
    (field) => field in COLUMN_BY_FIELD && changes[field] !== undefined
  );
  if (fields.length === 0) return getEmployee(db, id);

  const params: Record<string, string | number> = { id };
  for (const field of fields) params[field] = changes[field] as string | number;
  const assignments = fields.map((field) => `${COLUMN_BY_FIELD[field]} = @${field}`).join(", ");

  try {
    const info = db.prepare(`UPDATE employees SET ${assignments} WHERE id = @id`).run(params);
    return info.changes > 0 ? getEmployee(db, id) : undefined;
  } catch (err) {
    if (isUniqueViolation(err)) throw new DuplicateEmailError(String(changes.email));
    throw err;
  }
}

export function deleteEmployee(db: Db, id: number): boolean {
  return db.prepare("DELETE FROM employees WHERE id = ?").run(id).changes > 0;
}