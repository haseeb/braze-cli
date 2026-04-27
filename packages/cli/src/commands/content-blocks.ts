import { Command } from "commander";
import { BrazeClient } from "../lib/braze-client.js";
import { parseContentBlocksCsv } from "../lib/csv.js";
import { resolveWorkspace } from "../lib/config.js";
import { print } from "../lib/output.js";
import type { ContentBlockBulkInput, OutputFormat } from "../lib/types.js";

export const contentBlocksCommand = (): Command => {
  const cmd = new Command("content-blocks").description("Manage Braze content blocks");

  cmd
    .command("list")
    .option("-w, --workspace <workspace>", "Workspace name")
    .option("-o, --output <format>", "table|json|yaml", "table")
    .action(async (opts: { workspace?: string; output: OutputFormat }) => {
      const workspace = resolveWorkspace(opts.workspace);
      const client = new BrazeClient(workspace);
      const rows = await client.listContentBlocks();
      print(rows, opts.output);
    });

  cmd
    .command("get")
    .argument("<id>", "Content block ID")
    .option("-w, --workspace <workspace>", "Workspace name")
    .option("-o, --output <format>", "table|json|yaml", "json")
    .action(async (id: string, opts: { workspace?: string; output: OutputFormat }) => {
      const workspace = resolveWorkspace(opts.workspace);
      const client = new BrazeClient(workspace);
      const row = await client.getContentBlock(id);
      print(row, opts.output);
    });

  cmd
    .command("bulk-update")
    .description("Bulk update content blocks from CSV with id,content columns")
    .requiredOption("--from <path>", "CSV file path")
    .option("-w, --workspace <workspace>", "Workspace name")
    .option("--dry-run", "Only parse/show rows without making API changes", false)
    .option("-o, --output <format>", "table|json|yaml", "table")
    .action(
      async (opts: { from: string; workspace?: string; dryRun: boolean; output: OutputFormat }) => {
        const rows: ContentBlockBulkInput[] = parseContentBlocksCsv(opts.from);

        if (opts.dryRun) {
          print(
            rows.map((row) => ({ id: row.id, content_preview: row.content.slice(0, 80) })),
            opts.output
          );
          return;
        }

        const workspace = resolveWorkspace(opts.workspace);
        const client = new BrazeClient(workspace);
        const response = await client.bulkUpdateContentBlocks(rows);
        print(response, opts.output);
      }
    );

  return cmd;
};
