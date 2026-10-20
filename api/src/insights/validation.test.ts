import { describe, it, expect } from "vitest";
import { validateSalaryStatsQuery } from "./validation";

describe("validateSalaryStatsQuery", () => {
  it("defaults to grouping by country", () => {
    expect(validateSalaryStatsQuery({})).toMatchObject({ ok: true, data: { groupBy: "country" } });
  });

  it("accepts each supported grouping and optional filters", () => {
    expect(validateSalaryStatsQuery({ groupBy: "jobTitle", country: ["India"] })).toMatchObject({
      ok: true,
      data: { groupBy: "jobTitle", country: ["India"] },
    });
  });

  it("rejects an unknown grouping", () => {
    expect(validateSalaryStatsQuery({ groupBy: "salary" }).ok).toBe(false);
  });
});