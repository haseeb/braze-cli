import { Command } from "commander";
import { BrazeClient } from "../lib/braze-client.js";
import { resolveWorkspace } from "../lib/config.js";
import { parseOutputFormat, print } from "../lib/output.js";
import { print } from "../lib/output.js";
import { resolveWorkspace } from "../lib/config.js";
import type { OutputFormat } from "../lib/types.js";

export const segmentsCommand = (): Command => {
  const cmd = new Command("segments").description("Manage Braze segments");

  cmd
    .command("list")
    .option("-w, --workspace <workspace>", "Workspace name")
    .option("-o, --output <format>", "table|json|yaml", parseOutputFormat, "table")
    .option("-o, --output <format>", "table|json|yaml", "table")
    .action(async (opts: { workspace?: string; output: OutputFormat }) => {
      const workspace = resolveWorkspace(opts.workspace);
      const client = new BrazeClient(workspace);
      const rows = await client.listSegments();
      print(rows, opts.output);
    });

  cmd
    .command("get")
    .argument("<id>", "Segment ID")
    .option("-w, --workspace <workspace>", "Workspace name")
    .option("-o, --output <format>", "table|json|yaml", parseOutputFormat, "json")
    .option("-o, --output <format>", "table|json|yaml", "json")
    .action(async (id: string, opts: { workspace?: string; output: OutputFormat }) => {
      const workspace = resolveWorkspace(opts.workspace);
      const client = new BrazeClient(workspace);
      const row = await client.getSegment(id);
      print(row, opts.output);
    });

  return cmd;
};
