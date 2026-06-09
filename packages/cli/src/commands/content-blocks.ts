import { Command } from "commander";
import chalk from "chalk";
import { BrazeClient } from "@braze-oss/core";
import { parseContentBlocksCsv } from "@braze-oss/core";
import { resolveWorkspace } from "@braze-oss/core";
import { parseOutputFormat, print } from "@braze-oss/core";
import { planContentBlockUpdate, applyPlan } from "@braze-oss/core";
import type { ContentBlockBulkInput, OutputFormat } from "@braze-oss/core";

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

  cmd
    .command("plan")
    .description("Plan a content block update and show the diff")
    .argument("<id>", "Content block ID")
    .requiredOption("--content <content>", "New content")
    .option("-w, --workspace <workspace>", "Workspace name")
    .action(async (id: string, opts: { content: string; workspace?: string }) => {
      const workspace = resolveWorkspace(opts.workspace);
      const client = new BrazeClient(workspace);
      const result = await planContentBlockUpdate(client, id, opts.content);

      console.log(chalk.bold(`\nPlan: ${result.planId}`));
      console.log(chalk.gray(`Content block: ${result.contentBlockId}`));
      console.log(chalk.gray(`Workspace: ${result.workspace}`));
      console.log(chalk.bold("\nDiff:"));
      console.log(result.diff || "(no changes)");

      console.log(chalk.yellow(`\nTo apply, run: braze content-blocks apply ${result.planId} --token ${result.token}`));
    });

  cmd
    .command("apply")
    .description("Apply a planned content block update")
    .argument("<planId>", "Plan ID")
    .requiredOption("--token <token>", "Confirmation token from plan step")
    .option("-w, --workspace <workspace>", "Workspace name")
    .action(async (planId: string, opts: { token: string; workspace?: string }) => {
      const workspace = resolveWorkspace(opts.workspace);
      const client = new BrazeClient(workspace);
      const result = await applyPlan(client, planId, opts.token);

      console.log(chalk.green(`Applied plan ${planId}`));
      print(result, "json");
    });

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
