import type { Db } from "../db";

export interface NewEmployee {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  country: string;
  currency: string;
  salary: number;
  hireDate: string;
}

export function insertEmployees(db: Db, employees: NewEmployee[]): void {
  const insert = db.prepare(`
    INSERT INTO employees
      (first_name, last_name, email, job_title, department, country, currency, salary, hire_date)
    VALUES
      (@firstName, @lastName, @email, @jobTitle, @department, @country, @currency, @salary, @hireDate)
  `);
  // One transaction: much faster, and all-or-nothing.
  db.transaction((rows: NewEmployee[]) => {
    for (const row of rows) insert.run(row);
  })(employees);
}