import { Command } from "commander";
import {
  BrazeClient,
  resolveWorkspace,
  runOptimizationAudit,
  parseOutputFormat,
  print,
} from "@braze-oss/core";
import type { OutputFormat } from "@braze-oss/core";

export const auditCommand = (): Command => {
  const cmd = new Command("audit")
    .description("Scan campaigns and canvases for optimization opportunities")
    .option("-w, --workspace <workspace>", "Workspace name")
    .option("--campaigns <ids>", "Comma-separated campaign IDs to audit")
    .option("--canvases <ids>", "Comma-separated canvas IDs to audit")
    .option("-o, --output <format>", "table|json|yaml", parseOutputFormat, "json")
    .action(
      async (opts: {
        workspace?: string;
        campaigns?: string;
        canvases?: string;
        output: OutputFormat;
      }) => {
        const client = new BrazeClient(resolveWorkspace(opts.workspace));
        const split = (v?: string): string[] | undefined =>
          v ? v.split(",").map((s) => s.trim()).filter(Boolean) : undefined;

        const result = await runOptimizationAudit(client, {
          campaignIds: split(opts.campaigns),
          canvasIds: split(opts.canvases),
        });
        print(result, opts.output);
      },
    );

  return cmd;
};
