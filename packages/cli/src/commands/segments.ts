import { Command } from "commander";
import { BrazeClient } from "@braze-oss/core";
import { resolveWorkspace } from "@braze-oss/core";
import { parseOutputFormat, print } from "@braze-oss/core";
import type { OutputFormat } from "@braze-oss/core";

export const segmentsCommand = (): Command => {
  const cmd = new Command("segments").description("Manage Braze segments");

  cmd
    .command("list")
    .option("-w, --workspace <workspace>", "Workspace name")
    .option("-o, --output <format>", "table|json|yaml", parseOutputFormat, "table")
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
    .action(async (id: string, opts: { workspace?: string; output: OutputFormat }) => {
      const workspace = resolveWorkspace(opts.workspace);
      const client = new BrazeClient(workspace);
      const row = await client.getSegment(id);
      print(row, opts.output);
    });

  return cmd;
};
