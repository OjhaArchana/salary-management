import { describe, it, expect } from "vitest";
import { validateEmployeeInput, validateEmployeeUpdate, validateListQuery } from "./validation";

const valid = {
  firstName: "Asha",
  lastName: "Rao",
  email: "Asha.Rao@acme.com",
  jobTitle: "Software Engineer",
  department: "Engineering",
  country: "India",
  currency: "inr",
  salary: 2000000,
  hireDate: "2022-04-01",
};

function errorFields(result: { ok: boolean; errors?: { field: string }[] }): string[] {
  return result.ok ? [] : (result.errors ?? []).map((e) => e.field);
}

describe("validateEmployeeInput", () => {
  it("accepts a valid employee and normalises email and currency", () => {
    const result = validateEmployeeInput(valid);
    expect(result).toMatchObject({ ok: true, data: { email: "asha.rao@acme.com", currency: "INR" } });
  });

  it("rejects a missing required field", () => {
    const { firstName, ...rest } = valid;
    expect(errorFields(validateEmployeeInput(rest))).toContain("firstName");
  });

  it("rejects a negative salary", () => {
    expect(errorFields(validateEmployeeInput({ ...valid, salary: -1 }))).toContain("salary");
  });

  it("rejects a fractional salary", () => {
    expect(errorFields(validateEmployeeInput({ ...valid, salary: 100.5 }))).toContain("salary");
  });

  it("rejects an invalid email", () => {
    expect(errorFields(validateEmployeeInput({ ...valid, email: "not-an-email" }))).toContain("email");
  });

  it("rejects an impossible date", () => {
    expect(errorFields(validateEmployeeInput({ ...valid, hireDate: "2022-02-31" }))).toContain("hireDate");
  });
});

describe("validateEmployeeUpdate", () => {
  it("accepts a partial update", () => {
    expect(validateEmployeeUpdate({ salary: 5 })).toMatchObject({ ok: true, data: { salary: 5 } });
  });

  it("rejects an empty update", () => {
    expect(validateEmployeeUpdate({}).ok).toBe(false);
  });

  it("still validates the fields that are provided", () => {
    expect(errorFields(validateEmployeeUpdate({ salary: -5 }))).toContain("salary");
  });
});

describe("validateListQuery", () => {
  it("applies defaults for an empty query", () => {
    expect(validateListQuery({})).toMatchObject({
      ok: true,
      data: { page: 1, pageSize: 25, sortBy: "id", sortDir: "asc" },
    });
  });

  it("coerces numeric strings from the query string", () => {
    expect(validateListQuery({ page: "2", pageSize: "10" })).toMatchObject({
      ok: true,
      data: { page: 2, pageSize: 10 },
    });
  });

  it("rejects an out-of-range page size and an unknown sort field", () => {
    expect(validateListQuery({ pageSize: "0" }).ok).toBe(false);
    expect(validateListQuery({ sortBy: "password" }).ok).toBe(false);
  });
});