import { describe, expect, it } from "vitest";
import { lintLiquid, previewLiquid } from "../src/liquid.js";

describe("lintLiquid", () => {
  it("passes a simple valid template", () => {
    const result = lintLiquid("Hello {{ first_name }}");
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("detects mismatched braces", () => {
    const result = lintLiquid("Hello {{ first_name ");
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.message.includes("Mismatched"))).toBe(true);
  });

  it("warns about missing spaces", () => {
    const result = lintLiquid("Hello {{first_name}}");
    expect(result.valid).toBe(true);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it("returns a preview", () => {
    const template = "A".repeat(250) + " long template";
    const result = lintLiquid(template);
    expect(result.preview).toBe(template.slice(0, 200));
  });
});

describe("previewLiquid", () => {
  it("replaces variables with sample data", () => {
    const result = previewLiquid("Hello {{ first_name }}", {
      first_name: "Alice",
    });
    expect(result).toBe("Hello Alice");
  });

  it("uses default when variable missing", () => {
    const result = previewLiquid("Hello {{ first_name | default: 'there' }}", {});
    expect(result).toBe("Hello there");
  });

  it("leaves variable tags without sample data", () => {
    const result = previewLiquid("Hello {{ first_name }}");
    expect(result).toBe("Hello {{first_name}}");
  });

  it("handles nested variable paths", () => {
    const result = previewLiquid("{{ user.name }}", {
      user: { name: "Bob" },
    });
    expect(result).toBe("Bob");
  });
});
