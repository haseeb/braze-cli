import { Command } from "commander";
import { BrazeClient } from "../lib/braze-client.js";
import { parseContentBlocksCsv } from "../lib/csv.js";
import { resolveWorkspace } from "../lib/config.js";
import { parseOutputFormat, print } from "../lib/output.js";
import type { ContentBlockBulkInput, OutputFormat } from "../lib/types.js";

export const contentBlocksCommand = (): Command => {
  const cmd = new Command("content-blocks").description("Manage Braze content blocks");

  cmd
    .command("list")
    .option("-w, --workspace <workspace>", "Workspace name")
    .option("-o, --output <format>", "table|json|yaml", parseOutputFormat, "table")
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
    .option("-o, --output <format>", "table|json|yaml", parseOutputFormat, "json")
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
    .option("--concurrency <number>", "Number of updates to run in parallel", "4")
    .option("--fail-fast", "Stop immediately after first failed update", false)
    .option("-o, --output <format>", "table|json|yaml", parseOutputFormat, "table")
    .action(
      async (opts: {
        from: string;
        workspace?: string;
        dryRun: boolean;
        concurrency: string;
        failFast: boolean;
        output: OutputFormat;
      }) => {
        const rows = parseContentBlocksCsv(opts.from);

        if (opts.dryRun) {
          print(
            rows.map((row) => ({ id: row.id, content_preview: row.content.slice(0, 80) })),
            opts.output
          );
          return;
        }

        const parsedConcurrency = Number.parseInt(opts.concurrency, 10);
        if (!Number.isFinite(parsedConcurrency) || parsedConcurrency < 1 || parsedConcurrency > 20) {
          throw new Error("--concurrency must be an integer between 1 and 20.");
        }

        const workspace = resolveWorkspace(opts.workspace);
        const client = new BrazeClient(workspace);
        const results = await updateInBatches(client, rows, parsedConcurrency, opts.failFast);
        print(results, opts.output);
      }
    );

  return cmd;
};

const updateInBatches = async (
  client: BrazeClient,
  rows: ContentBlockBulkInput[],
  concurrency: number,
  failFast: boolean
): Promise<Array<{ id: string; status: "updated" | "failed"; message: string }>> => {
  const results: Array<{ id: string; status: "updated" | "failed"; message: string }> = [];

  for (let i = 0; i < rows.length; i += concurrency) {
    const batch = rows.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (row) => {
        try {
          const response = await client.updateContentBlock(row.id, row.content);
          return { id: row.id, status: "updated" as const, message: response.message ?? "updated" };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          return { id: row.id, status: "failed" as const, message };
        }
      })
    );

    results.push(...batchResults);

    if (failFast && batchResults.some((res) => res.status === "failed")) {
      break;
    }
  }

  return results;
};
