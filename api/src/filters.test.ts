import { describe, it, expect } from "vitest";
import { buildInFilters } from "./filters";

describe("buildInFilters", () => {
  it("returns nothing when no filter has values", () => {
    expect(buildInFilters([{ column: "country" }, { column: "department", values: [] }])).toEqual({
      conditions: [],
      params: {},
    });
  });

  it("builds an IN clause with one named parameter per value", () => {
    const { conditions, params } = buildInFilters([{ column: "country", values: ["India", "Germany"] }]);
    expect(conditions).toEqual(["country IN (@country_0, @country_1)"]);
    expect(params).toEqual({ country_0: "India", country_1: "Germany" });
  });

  it("ignores duplicate values", () => {
    const { conditions, params } = buildInFilters([{ column: "country", values: ["India", "India"] }]);
    expect(conditions).toEqual(["country IN (@country_0)"]);
    expect(params).toEqual({ country_0: "India" });
  });

  it("combines several columns", () => {
    const { conditions } = buildInFilters([
      { column: "country", values: ["India"] },
      { column: "job_title", values: ["QA Engineer"] },
    ]);
    expect(conditions).toEqual(["country IN (@country_0)", "job_title IN (@job_title_0)"]);
  });
});