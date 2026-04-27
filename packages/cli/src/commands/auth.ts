import { Command } from "commander";
import chalk from "chalk";
import {
  configPath,
  ensureConfig,
  listWorkspaces,
  setDefaultWorkspace,
  upsertWorkspace
} from "../lib/config.js";
import { saveApiKey } from "../lib/credentials.js";
import { parseOutputFormat, print } from "../lib/output.js";
import type { OutputFormat } from "../lib/types.js";

export const authCommand = (): Command => {
  const cmd = new Command("auth").description("Authentication and workspace helpers");

  cmd
    .command("init")
    .description("Create ~/.braze/config.yaml if missing")
    .action(() => {
      ensureConfig();
      console.log(chalk.green(`Initialized Braze config at ${configPath}`));
      console.log(chalk.yellow("Set BRAZE_API_KEY or use 'braze auth login --workspace <name> --api-key <key>'."));
    });

  cmd
    .command("login")
    .description("Store API key in system keychain for a workspace (if keytar is available)")
    .requiredOption("-w, --workspace <workspace>", "Workspace name")
    .requiredOption("--api-key <apiKey>", "Braze REST API key")
    .action(async (opts: { workspace: string; apiKey: string }) => {
      const ok = await saveApiKey(opts.workspace, opts.apiKey);
      if (ok) {
        console.log(chalk.green(`Saved API key in keychain for workspace '${opts.workspace}'.`));
      } else {
        console.log(
          chalk.yellow(
            "Unable to access system keychain (keytar unavailable). Set BRAZE_API_KEY (or workspace apiKeyEnv) instead."
          )
        );
      }
    });

  cmd
    .command("workspace-add")
    .description("Add or update a workspace config")
    .requiredOption("-w, --workspace <workspace>", "Workspace name")
    .requiredOption("--base-url <baseUrl>", "Braze REST base URL (e.g. https://rest.iad-01.braze.com)")
    .option("--api-key-env <envVar>", "Environment variable for API key", "BRAZE_API_KEY")
    .action((opts: { workspace: string; baseUrl: string; apiKeyEnv: string }) => {
      upsertWorkspace({
        name: opts.workspace,
        baseUrl: opts.baseUrl,
        apiKeyEnv: opts.apiKeyEnv,
        restEndpoint: ""
      });
      console.log(chalk.green(`Workspace '${opts.workspace}' saved.`));
    });

  cmd
    .command("workspace-use")
    .description("Set default workspace")
    .argument("<workspace>", "Workspace name")
    .action((workspace: string) => {
      setDefaultWorkspace(workspace);
      console.log(chalk.green(`Default workspace set to '${workspace}'.`));
    });

  cmd
    .command("workspace-list")
    .description("List configured workspaces")
    .option("-o, --output <format>", "table|json|yaml", parseOutputFormat, "table")
    .action((opts: { output: OutputFormat }) => {
      const rows = listWorkspaces();
      print(rows, opts.output);
    });

  return cmd;
};
