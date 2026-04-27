import { Command } from "commander";
import chalk from "chalk";
import { configPath, ensureConfig } from "../lib/config.js";

export const authCommand = (): Command => {
  const cmd = new Command("auth").description("Authentication helpers");

  cmd
    .command("init")
    .description("Create ~/.braze/config.yaml if missing")
    .action(() => {
      ensureConfig();
      console.log(chalk.green(`Initialized Braze config at ${configPath}`));
      console.log(chalk.yellow("Set BRAZE_API_KEY in your environment for API calls."));
    });

  return cmd;
};
