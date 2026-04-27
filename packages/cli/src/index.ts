#!/usr/bin/env node
import { Command } from "commander";
import { authCommand } from "./commands/auth.js";
import { campaignsCommand } from "./commands/campaigns.js";
import { canvasesCommand } from "./commands/canvases.js";
import { contentBlocksCommand } from "./commands/content-blocks.js";
import { segmentsCommand } from "./commands/segments.js";

const program = new Command();

program
  .name("braze")
  .description("Unofficial Braze CLI for marketers and MarTech engineers")
  .version("0.2.0")
  .showHelpAfterError(true)
  .addHelpText(
    "after",
    `
Examples:
  braze auth init
  braze auth workspace-add --workspace prod --base-url https://rest.iad-01.braze.com
  braze campaigns list --workspace prod --output json
  braze content-blocks bulk-update --from ./blocks.csv --workspace staging --dry-run
`
  );

program.addCommand(authCommand());
program.addCommand(campaignsCommand());
program.addCommand(canvasesCommand());
program.addCommand(segmentsCommand());
program.addCommand(contentBlocksCommand());

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exitCode = 1;
});
