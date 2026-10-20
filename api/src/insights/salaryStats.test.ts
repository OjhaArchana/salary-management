import { beforeEach, describe, it, expect } from "vitest";
import { openDb, type Db } from "../db";
import { createEmployee } from "../employees/repository";
import { makeEmployee } from "../employees/testHelpers";
import { salaryStats } from "./salaryStats";

let db: Db;
let counter = 0;

function add(overrides: Parameters<typeof makeEmployee>[0] = {}) {
  counter += 1;
  return createEmployee(db, makeEmployee({ email: `person${counter}@acme.com`, ...overrides }));
}

beforeEach(() => {
  db = openDb(":memory:");
});

describe("salaryStats", () => {
  it("computes headcount, min, max, average and median for a group", () => {
    [100, 200, 600].forEach((salary) => add({ salary }));
    const [row] = salaryStats(db, { groupBy: "country" });
    expect(row).toEqual({
      group: "India",
      currency: "INR",
      headcount: 3,
      min: 100,
      max: 600,
      average: 300,
      median: 200,
    });
  });

  it("uses the mean of the two middle salaries as the median for an even count", () => {
    [100, 200, 300, 1000].forEach((salary) => add({ salary }));
    const [row] = salaryStats(db, { groupBy: "country" });
    expect(row.median).toBe(250);
    expect(row.average).toBe(400);
  });

  it("returns the single salary as the median for a group of one", () => {
    add({ salary: 777 });
    expect(salaryStats(db, { groupBy: "country" })[0].median).toBe(777);
  });

  it("rounds the average to 2 decimals", () => {
    [1, 1, 2].forEach((salary) => add({ salary }));
    expect(salaryStats(db, { groupBy: "country" })[0].average).toBe(1.33);
  });

  it("keeps currencies in separate rows instead of mixing them", () => {
    add({ department: "Engineering", country: "India", currency: "INR", salary: 1000 });
    add({ department: "Engineering", country: "United States", currency: "USD", salary: 50 });
    const rows = salaryStats(db, { groupBy: "department" });
    expect(rows.map((r) => [r.group, r.currency, r.average])).toEqual([
      ["Engineering", "INR", 1000],
      ["Engineering", "USD", 50],
    ]);
  });

  it("groups by country, department and job title", () => {
    add({ country: "India", department: "Engineering", jobTitle: "QA Engineer" });
    add({ country: "Germany", currency: "EUR", department: "Sales", jobTitle: "Account Executive" });
    expect(salaryStats(db, { groupBy: "country" }).map((r) => r.group)).toEqual(["Germany", "India"]);
    expect(salaryStats(db, { groupBy: "department" }).map((r) => r.group)).toEqual(["Engineering", "Sales"]);
    expect(salaryStats(db, { groupBy: "jobTitle" }).map((r) => r.group)).toEqual([
      "Account Executive",
      "QA Engineer",
    ]);
  });

  it("applies filters before grouping", () => {
    add({ country: "India", department: "Engineering", salary: 100 });
    add({ country: "India", department: "Sales", salary: 900 });
    add({ country: "Germany", currency: "EUR", department: "Sales", salary: 500 });
    const rows = salaryStats(db, { groupBy: "department", country: "India" });
    expect(rows.map((r) => [r.group, r.headcount])).toEqual([
      ["Engineering", 1],
      ["Sales", 1],
    ]);
  });

  it("returns an empty list when nothing matches", () => {
    add();
    expect(salaryStats(db, { groupBy: "country", country: "Atlantis" })).toEqual([]);
  });
});