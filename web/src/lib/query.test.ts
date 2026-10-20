import { describe, it, expect } from "vitest";
import { buildQuery } from "./query";

describe("buildQuery", () => {
  it("returns an empty string when there are no params", () => {
    expect(buildQuery({})).toBe("");
  });

  it("skips empty and undefined values", () => {
    expect(buildQuery({ page: 2, search: "  ", country: undefined, department: "Sales" })).toBe(
      "?page=2&department=Sales"
    );
  });

  it("encodes special characters", () => {
    expect(buildQuery({ search: "a b&c" })).toBe("?search=a+b%26c");
  });

  it("repeats the key for each array value", () => {
    expect(buildQuery({ country: ["India", "Germany"], page: 1 })).toBe("?country=India&country=Germany&page=1");
  });

  it("skips empty arrays", () => {
    expect(buildQuery({ country: [] })).toBe("");
  });
});