import { describe, it, expect } from "vitest";
import { formatSalary } from "./format";

describe("formatSalary", () => {
  it("formats an amount in its own currency", () => {
    expect(formatSalary(1234567, "USD")).toBe("$1,234,567");
  });

  it("falls back to the code for an invalid currency", () => {
    expect(formatSalary(1000, "INVALID")).toBe("INVALID 1,000");
  });
});