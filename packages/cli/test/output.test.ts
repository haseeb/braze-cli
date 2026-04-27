import { describe, expect, it } from "vitest";

import { print } from "../src/lib/output.js";

describe("output", () => {
  it("supports json output without throwing", () => {
    expect(() => print([{ id: "1", name: "Test" }], "json")).not.toThrow();
  });

  it("supports yaml output without throwing", () => {
    expect(() => print([{ id: "1", name: "Test" }], "yaml")).not.toThrow();
  });

  it("supports table output without throwing", () => {
    expect(() => print([{ id: "1", name: "Test" }], "table")).not.toThrow();
  });
});
