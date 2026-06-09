import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getHarnessConfig, installSkill, listHarnesses, removeSkill } from "../src/lib/harness.js";

let tmpHome: string;
let skillSrc: string;

beforeEach(() => {
  tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "braze-home-"));
  vi.spyOn(os, "homedir").mockReturnValue(tmpHome);

  skillSrc = fs.mkdtempSync(path.join(os.tmpdir(), "braze-skill-"));
  fs.writeFileSync(path.join(skillSrc, "SKILL.md"), "# Test skill\n");
  fs.mkdirSync(path.join(skillSrc, "adapters"));
  fs.writeFileSync(path.join(skillSrc, "adapters", "codex.md"), "codex\n");
});

afterEach(() => {
  vi.restoreAllMocks();
  fs.rmSync(tmpHome, { recursive: true, force: true });
  fs.rmSync(skillSrc, { recursive: true, force: true });
});

describe("listHarnesses", () => {
  it("includes the documented first-class harnesses plus generic", () => {
    const harnesses = listHarnesses();
    expect(harnesses).toEqual(
      expect.arrayContaining(["claude-code", "codex", "goose", "generic"]),
    );
  });
});

describe("installSkill", () => {
  it("copies skill files into the harness directory under home", () => {
    const actions = installSkill(skillSrc, "claude-code", skillSrc, false);

    const skillId = path.basename(skillSrc);
    const target = path.join(tmpHome, ".claude/skills", skillId);
    expect(fs.existsSync(path.join(target, "SKILL.md"))).toBe(true);
    expect(fs.existsSync(path.join(target, "adapters", "codex.md"))).toBe(true);
    expect(actions.some((a) => a.includes("SKILL.md"))).toBe(true);
  });

  it("does not write anything in dry-run mode", () => {
    const actions = installSkill(skillSrc, "codex", skillSrc, true);
    const skillId = path.basename(skillSrc);
    const target = path.join(tmpHome, ".codex/skills", skillId);

    expect(fs.existsSync(target)).toBe(false);
    expect(actions[0]).toContain("[DRY-RUN]");
  });

  it("throws on an unknown harness", () => {
    expect(() => installSkill(skillSrc, "bogus", skillSrc, false)).toThrow(/Unknown harness/);
  });
});

describe("removeSkill", () => {
  it("removes a previously installed skill", () => {
    installSkill(skillSrc, "goose", skillSrc, false);
    const skillId = path.basename(skillSrc);
    const target = path.join(tmpHome, ".goose/skills", skillId);
    expect(fs.existsSync(target)).toBe(true);

    removeSkill("goose", skillId, false);
    expect(fs.existsSync(target)).toBe(false);
  });

  it("reports when a skill is not installed", () => {
    const actions = removeSkill("goose", "not-there", false);
    expect(actions[0]).toContain("not found");
  });
});

describe("getHarnessConfig", () => {
  it("returns config for a known harness and undefined otherwise", () => {
    expect(getHarnessConfig("claude-code")?.skillsDir).toBe(".claude/skills");
    expect(getHarnessConfig("nope")).toBeUndefined();
  });
});
