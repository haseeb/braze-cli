import { Command } from "commander";
import { BrazeClient } from "../lib/braze-client.js";
import { resolveWorkspace } from "../lib/config.js";
import { parseOutputFormat, print } from "../lib/output.js";
import type { OutputFormat } from "../lib/types.js";

export const canvasesCommand = (): Command => {
  const cmd = new Command("canvases").description("Manage Braze canvases");

  cmd
    .command("list")
    .option("-w, --workspace <workspace>", "Workspace name")
    .option("-o, --output <format>", "table|json|yaml", parseOutputFormat, "table")
    .action(async (opts: { workspace?: string; output: OutputFormat }) => {
      const workspace = resolveWorkspace(opts.workspace);
      const client = new BrazeClient(workspace);
      const rows = await client.listCanvases();
      print(rows, opts.output);
    });

  cmd
    .command("get")
    .argument("<id>", "Canvas ID")
    .option("-w, --workspace <workspace>", "Workspace name")
    .option("-o, --output <format>", "table|json|yaml", parseOutputFormat, "json")
    .action(async (id: string, opts: { workspace?: string; output: OutputFormat }) => {
      const workspace = resolveWorkspace(opts.workspace);
      const client = new BrazeClient(workspace);
      const row = await client.getCanvas(id);
      print(row, opts.output);
    });

  return cmd;
};
