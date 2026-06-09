import { Command } from "commander";
import { readFileSync } from "node:fs";
import { lintLiquid, previewLiquid, parseOutputFormat, print } from "@braze-oss/core";
import type { OutputFormat } from "@braze-oss/core";

const readTemplate = (template: string | undefined, file: string | undefined): string => {
  if (file) return readFileSync(file, "utf8");
  if (template) return template;
  throw new Error("Provide a template with --template <text> or --file <path>.");
};

export const liquidCommand = (): Command => {
  const cmd = new Command("liquid").description("Lint and preview Liquid templates");

  cmd
    .command("lint")
    .description("Statically check a Liquid template for errors and unsafe personalization")
    .option("-t, --template <text>", "Liquid template text")
    .option("-f, --file <path>", "Read the template from a file")
    .option("-o, --output <format>", "table|json|yaml", parseOutputFormat, "json")
    .action((opts: { template?: string; file?: string; output: OutputFormat }) => {
      const result = lintLiquid(readTemplate(opts.template, opts.file));
      print(result, opts.output);
      if (!result.valid) process.exitCode = 1;
    });

  cmd
    .command("preview")
    .description("Render a Liquid template with optional sample data")
    .option("-t, --template <text>", "Liquid template text")
    .option("-f, --file <path>", "Read the template from a file")
    .option("-d, --data <json>", "Sample data as a JSON object")
    .action((opts: { template?: string; file?: string; data?: string }) => {
      const sampleData = opts.data ? (JSON.parse(opts.data) as Record<string, unknown>) : undefined;
      const rendered = previewLiquid(readTemplate(opts.template, opts.file), sampleData);
      process.stdout.write(rendered + "\n");
    });

  return cmd;
};
