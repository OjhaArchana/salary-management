import { describe, it, expect } from "vitest";
import { filterBySearch, toggleValue, triggerLabel } from "./multiselect";

describe("toggleValue", () => {
  it("adds a value that is not selected", () => {
    expect(toggleValue(["India"], "Germany")).toEqual(["India", "Germany"]);
  });

  it("removes a value that is already selected", () => {
    expect(toggleValue(["India", "Germany"], "India")).toEqual(["Germany"]);
  });

  it("does not mutate the original array", () => {
    const original = ["India"];
    toggleValue(original, "Germany");
    expect(original).toEqual(["India"]);
  });
});

describe("triggerLabel", () => {
  it("shows just the label when nothing is selected", () => {
    expect(triggerLabel("Country", [])).toBe("Country");
  });

  it("shows the value when one is selected", () => {
    expect(triggerLabel("Country", ["India"])).toBe("Country: India");
  });

  it("shows a count when several are selected", () => {
    expect(triggerLabel("Country", ["India", "Germany"])).toBe("Country (2)");
  });
});

describe("filterBySearch", () => {
  const options = ["India", "Indonesia", "Germany"];

  it("returns everything for an empty search", () => {
    expect(filterBySearch(options, "  ")).toEqual(options);
  });

  it("matches case-insensitively", () => {
    expect(filterBySearch(options, "IND")).toEqual(["India", "Indonesia"]);
  });
});