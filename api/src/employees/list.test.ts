import { beforeEach, describe, it, expect } from "vitest";
import { openDb, type Db } from "../db";
import { listEmployees } from "./list";
import { createEmployee } from "./repository";
import { makeEmployee } from "./testHelpers";

let db: Db;
beforeEach(() => {
  db = openDb(":memory:");
  createEmployee(
    db,
    makeEmployee({ firstName: "Asha", lastName: "Rao", email: "asha@acme.com", country: "India", department: "Engineering", salary: 3000 })
  );
  createEmployee(
    db,
    makeEmployee({ firstName: "Liam", lastName: "Smith", email: "liam@acme.com", country: "United States", currency: "USD", department: "Sales", jobTitle: "Account Executive", salary: 1000 })
  );
  createEmployee(
    db,
    makeEmployee({ firstName: "Priya", lastName: "Nair", email: "priya@acme.com", country: "India", department: "Sales", jobTitle: "Sales Manager", salary: 2000 })
  );
});

const emails = (items: { email: string }[]) => items.map((e) => e.email);

describe("listEmployees pagination", () => {
  it("returns the first page with totals", () => {
    const result = listEmployees(db, { page: 1, pageSize: 2 });
    expect(emails(result.items)).toEqual(["asha@acme.com", "liam@acme.com"]);
    expect(result).toMatchObject({ total: 3, page: 1, pageSize: 2, totalPages: 2 });
  });

  it("returns the remaining items on the last page", () => {
    const result = listEmployees(db, { page: 2, pageSize: 2 });
    expect(emails(result.items)).toEqual(["priya@acme.com"]);
  });

  it("returns no items beyond the last page", () => {
    const result = listEmployees(db, { page: 5, pageSize: 2 });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(3);
  });

  it("clamps the page size to 100", () => {
    expect(listEmployees(db, { pageSize: 1000 }).pageSize).toBe(100);
  });
});

describe("listEmployees filters", () => {
  it("filters by country", () => {
    const result = listEmployees(db, { country: ["India"] });
    expect(result.total).toBe(2);
  });

  it("combines filters", () => {
    const result = listEmployees(db, { country: ["India"], department: ["Sales"] });
    expect(emails(result.items)).toEqual(["priya@acme.com"]);
  });

    it("matches any of several values for one filter", () => {
    expect(listEmployees(db, { country: ["India", "United States"] }).total).toBe(3);
  });

  it("treats an empty list as no filter", () => {
    expect(listEmployees(db, { country: [] }).total).toBe(3);
  });
});

describe("listEmployees search", () => {
  it("matches a name fragment, ignoring case", () => {
    expect(emails(listEmployees(db, { search: "SMI" }).items)).toEqual(["liam@acme.com"]);
  });

  it("matches a full name", () => {
    expect(emails(listEmployees(db, { search: "asha rao" }).items)).toEqual(["asha@acme.com"]);
  });

  it("treats % literally instead of as a wildcard", () => {
    expect(listEmployees(db, { search: "%" }).total).toBe(0);
  });
});

describe("listEmployees sorting", () => {
  it("sorts by salary descending", () => {
    const result = listEmployees(db, { sortBy: "salary", sortDir: "desc" });
    expect(emails(result.items)).toEqual(["asha@acme.com", "priya@acme.com", "liam@acme.com"]);
  });
});