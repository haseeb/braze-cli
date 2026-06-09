import { afterEach, describe, expect, it, vi } from "vitest";
import { Command } from "commander";
import { liquidCommand } from "../src/commands/liquid.js";
import { insightsCommand } from "../src/commands/insights.js";
import { auditCommand } from "../src/commands/audit.js";

const run = async (build: () => Command, argv: string[]): Promise<string> => {
  const logs: string[] = [];
  const logSpy = vi.spyOn(console, "log").mockImplementation((...a) => {
    logs.push(a.join(" "));
  });
  const outSpy = vi.spyOn(process.stdout, "write").mockImplementation((chunk: unknown) => {
    logs.push(String(chunk));
    return true;
  });

  const program = new Command();
  program.exitOverride();
  program.addCommand(build());
  await program.parseAsync(["node", "braze", ...argv]);

  logSpy.mockRestore();
  outSpy.mockRestore();
  return logs.join("\n");
};

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
});

describe("liquid command", () => {
  it("lints a template and reports issues as JSON", async () => {
    const out = await run(liquidCommand, ["liquid", "lint", "--template", "Hello {{ name }}"]);
    const parsed = JSON.parse(out);
    expect(parsed).toHaveProperty("valid");
    expect(parsed).toHaveProperty("issues");
  });

  it("previews a template with sample data", async () => {
    const out = await run(liquidCommand, [
      "liquid",
      "preview",
      "--template",
      "Hi {{ name }}",
      "--data",
      JSON.stringify({ name: "Sam" }),
    ]);
    expect(out).toContain("Hi Sam");
  });

  it("errors when no template is supplied", async () => {
    await expect(run(liquidCommand, ["liquid", "lint"])).rejects.toThrow();
  });
});

describe("command builders", () => {
  it("expose the expected command names", () => {
    expect(liquidCommand().name()).toBe("liquid");
    expect(insightsCommand().name()).toBe("insights");
    expect(auditCommand().name()).toBe("audit");
  });
});
