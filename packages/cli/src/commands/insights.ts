import { Command } from "commander";
import {
  BrazeClient,
  resolveWorkspace,
  generateWeeklyInsights,
  parseOutputFormat,
  print,
} from "@braze-oss/core";
import type { OutputFormat } from "@braze-oss/core";

export const insightsCommand = (): Command => {
  const cmd = new Command("insights").description("Generate narrative performance insights");

  cmd
    .command("weekly")
    .description("Summarize recent campaign, canvas, and segment activity")
    .option("-w, --workspace <workspace>", "Workspace name")
    .option("-d, --days-back <n>", "Days to look back", (v) => parseInt(v, 10), 7)
    .option("-o, --output <format>", "table|json|yaml", parseOutputFormat, "json")
    .action(async (opts: { workspace?: string; daysBack: number; output: OutputFormat }) => {
      const client = new BrazeClient(resolveWorkspace(opts.workspace));
      const result = await generateWeeklyInsights(client, { daysBack: opts.daysBack });
      print(result, opts.output);
    });

  return cmd;
};
