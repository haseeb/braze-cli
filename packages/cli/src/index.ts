#!/usr/bin/env node
import { Command } from "commander";
import { authCommand } from "./commands/auth.js";
import { campaignsCommand } from "./commands/campaigns.js";
import { canvasesCommand } from "./commands/canvases.js";
import { segmentsCommand } from "./commands/segments.js";

const program = new Command();

program
  .name("braze")
  .description("Unofficial Braze CLI for marketers and MarTech engineers")
  .version("0.1.0");

program.addCommand(authCommand());
program.addCommand(campaignsCommand());
program.addCommand(canvasesCommand());
program.addCommand(segmentsCommand());

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exitCode = 1;
});
