import { describe, expect, it } from "vitest";
import { redact } from "../src/redact.js";

describe("redact", () => {
  it("leaves non-PII data unchanged", () => {
    const input = { id: "abc", name: "Test Campaign", status: "active" };
    expect(redact(input)).toEqual(input);
  });

  it("redacts PII field names (case-insensitive)", () => {
    const input = { email: "user@example.com", First_Name: "Alice", account_name: "test-account" };
    const result = redact(input) as Record<string, unknown>;
    expect(result.email).toBe("[REDACTED]");
    expect(result.First_Name).toBe("[REDACTED]");
    expect(result.account_name).toBe("test-account");
  });

  it("redacts email-like string values", () => {
    const input = { description: "Contact alice@example.com for help" };
    const result = redact(input) as Record<string, unknown>;
    expect(result.description).toBe("[REDACTED]");
  });

  it("recursively redacts nested objects", () => {
    const input = {
      attributes: {
        email: "user@test.com",
        first_name: "Bob",
        tags: ["vip"],
      },
    };
    const result = redact(input) as Record<string, unknown>;
    const attrs = result.attributes as Record<string, unknown>;
    expect(attrs.email).toBe("[REDACTED]");
    expect(attrs.first_name).toBe("[REDACTED]");
    expect(attrs.tags).toEqual(["vip"]);
  });

  it("redacts in arrays", () => {
    const input = [
      { email: "a@b.com", name: "A" },
      { email: "c@d.com", name: "C" },
    ];
    const result = redact(input) as Array<Record<string, unknown>>;
    expect(result[0].email).toBe("[REDACTED]");
    expect(result[0].name).toBe("A");
    expect(result[1].email).toBe("[REDACTED]");
  });

  it("handles null and undefined", () => {
    expect(redact(null)).toBeNull();
    expect(redact(undefined)).toBeUndefined();
  });

  it("handles primitives unchanged", () => {
    expect(redact(42)).toBe(42);
    expect(redact(true)).toBe(true);
    expect(redact("hello")).toBe("hello");
  });

  it("redacts known PII fields with underscores and hyphens", () => {
    const input = {
      external_user_id: "user-123",
      "push-token": "abc123",
      phone_number: "555-1234",
    };
    const result = redact(input) as Record<string, unknown>;
    expect(result.external_user_id).toBe("[REDACTED]");
    expect(result["push-token"]).toBe("[REDACTED]");
    expect(result.phone_number).toBe("[REDACTED]");
  });
});
