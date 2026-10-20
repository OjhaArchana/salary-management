import { describe, it, expect } from "vitest";
import { openDb } from "./db";
import { insertEmployees, type NewEmployee } from "./seed/insert";

const sample: NewEmployee = {
  firstName: "Asha",
  lastName: "Rao",
  email: "asha.rao@acme.com",
  jobTitle: "Software Engineer",
  department: "Engineering",
  country: "India",
  currency: "INR",
  salary: 2000000,
  hireDate: "2022-04-01",
};

describe("database", () => {
  it("creates indexes on country, department and job_title", () => {
    const db = openDb(":memory:");
    const names = (db.prepare("PRAGMA index_list(employees)").all() as { name: string }[]).map((r) => r.name);
    expect(names).toEqual(
      expect.arrayContaining(["idx_employees_country", "idx_employees_department", "idx_employees_job_title"])
    );
  });

  it("inserts employees", () => {
    const db = openDb(":memory:");
    insertEmployees(db, [sample]);
    const row = db.prepare("SELECT COUNT(*) AS c FROM employees").get() as { c: number };
    expect(row.c).toBe(1);
  });

  it("rolls back everything when one row is invalid (duplicate email)", () => {
    const db = openDb(":memory:");
    expect(() => insertEmployees(db, [sample, sample])).toThrow();
    const row = db.prepare("SELECT COUNT(*) AS c FROM employees").get() as { c: number };
    expect(row.c).toBe(0);
  });
});