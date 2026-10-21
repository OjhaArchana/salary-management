import { describe, it, expect } from "vitest";
import { avatarColor, departmentBadge, initials } from "./avatar";

describe("initials", () => {
  it("uses the first letters of first and last name in upper case", () => {
    expect(initials("asha", "rao")).toBe("AR");
  });

  it("copes with a missing last name", () => {
    expect(initials("Asha", "")).toBe("A");
  });
});

describe("avatarColor", () => {
  it("is deterministic for the same name", () => {
    expect(avatarColor("Asha Rao")).toBe(avatarColor("Asha Rao"));
  });
});

describe("departmentBadge", () => {
  it("returns a specific style for a known department", () => {
    expect(departmentBadge("Engineering")).toContain("indigo");
  });

  it("falls back to a neutral style for an unknown department", () => {
    expect(departmentBadge("Legal")).toContain("slate");
  });
});