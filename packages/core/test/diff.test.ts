import { describe, expect, it } from "vitest";
import { computeDiff, applyDiff } from "../src/diff.js";

describe("computeDiff", () => {
  it("shows no changes for identical content", () => {
    const diff = computeDiff("hello", "hello");
    expect(diff).toBe("(no changes)");
  });

  it("shows line differences", () => {
    const diff = computeDiff("line1\nline2", "line1\nline3");
    expect(diff).toBe("  line1\n- line2\n+ line3");
  });

  it("handles added lines", () => {
    const diff = computeDiff("line1", "line1\nline2");
    expect(diff).toBe("  line1\n+ line2");
  });

  it("handles removed lines", () => {
    const diff = computeDiff("line1\nline2", "line1");
    expect(diff).toBe("  line1\n- line2");
  });

  it("handles empty old content", () => {
    const diff = computeDiff("", "new content");
    expect(diff).toBe("+ new content");
  });

  it("handles empty new content", () => {
    const diff = computeDiff("old content", "");
    expect(diff).toBe("- old content");
  });
});

describe("applyDiff", () => {
  it("reconstructs new content from diff", () => {
    const diff = "  line1\n- line2\n+ line3\n  line4";
    const result = applyDiff("line1\nline2\nline4", diff);
    expect(result).toBe("line1\nline3\nline4");
  });

  it("handles additions only", () => {
    const diff = "  line1\n+ line2";
    const result = applyDiff("line1", diff);
    expect(result).toBe("line1\nline2");
  });
});
