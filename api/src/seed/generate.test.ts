import { describe, it, expect } from "vitest";
import { generateEmployees } from "./generate";
import { COUNTRIES } from "./data";

describe("generateEmployees", () => {
  it("returns the requested number of employees", () => {
    expect(generateEmployees(250)).toHaveLength(250);
  });

  it("is deterministic for the same seed", () => {
    expect(generateEmployees(50, 1)).toEqual(generateEmployees(50, 1));
  });

  it("produces different data for different seeds", () => {
    expect(generateEmployees(50, 1)).not.toEqual(generateEmployees(50, 2));
  });

  it("generates unique emails", () => {
    const emails = generateEmployees(2000).map((e) => e.email);
    expect(new Set(emails).size).toBe(emails.length);
  });

  it("uses the currency of the employee's country", () => {
    for (const e of generateEmployees(500)) {
      expect(COUNTRIES.find((c) => c.name === e.country)?.currency).toBe(e.currency);
    }
  });

  it("generates positive whole-number salaries and valid hire dates", () => {
    for (const e of generateEmployees(500)) {
      expect(Number.isInteger(e.salary)).toBe(true);
      expect(e.salary).toBeGreaterThan(0);
      expect(e.hireDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});