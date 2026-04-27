# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

Unofficial Braze CLI plus an adjacent Claude Code skill, targeted at marketers and MarTech engineers who prefer terminal workflows over the Braze dashboard. v0.1 scaffold: read-only `list` / `get` for campaigns, canvases, and segments. Keychain credential storage and write operations are slated for v0.5+.

## Monorepo layout

npm workspaces with two packages:

- `packages/cli` — the `@braze/cli` TypeScript CLI (binary name: `braze`)
- `packages/skill` — `SKILL.md` and prompt templates (`templates/`) for the Claude Code skill; no build step

`docs/PRD.md` and `examples/workflow.md` are reference material, not code.

## Common commands

Run from the repo root unless noted. Root scripts delegate to the `@braze/cli` workspace.

```bash
npm install                  # install workspace deps (Node >= 20)
npm run build                # tsc -> packages/cli/dist
npm run lint                 # tsc --noEmit (type-check only; no ESLint configured)
npm run test                 # vitest run

# Single test file / single test (run inside packages/cli)
npm --workspace @braze/cli exec -- vitest run test/output.test.ts
npm --workspace @braze/cli exec -- vitest run -t "supports yaml output"

# Dev loop without building (tsx)
npm --workspace @braze/cli run dev -- campaigns list --output json

# Run the built CLI
node packages/cli/dist/index.js auth init
BRAZE_API_KEY=*** node packages/cli/dist/index.js campaigns list --output table
```

## Architecture

The CLI is a thin Commander.js shell over a single `BrazeClient`. All command files follow the same shape, so adding a new resource means copying one of them and wiring it in `src/index.ts`.

- `src/index.ts` — Commander root; registers `auth`, `campaigns`, `canvases`, `segments` and converts thrown errors into a non-zero exit code.
- `src/commands/*.ts` — one file per resource. Each exports a `<name>Command()` factory that defines `list` / `get` subcommands with `-w, --workspace` and `-o, --output` flags. Default output is `table` for `list` and `json` for `get`.
- `src/lib/braze-client.ts` — `BrazeClient` wraps `fetch` against `workspace.baseUrl`, sends `Authorization: Bearer <apiKey>`, and reads the API key from `process.env[workspace.apiKeyEnv ?? "BRAZE_API_KEY"]`. Non-2xx responses throw `Braze API <status>: <body>`.
- `src/lib/config.ts` — `ensureConfig()` lazily creates `~/.braze/config.yaml` with a default `dev` workspace pointing at `https://rest.iad-01.braze.com`. `resolveWorkspace(name?)` returns the named workspace or the `defaultWorkspace`, throwing if missing.
- `src/lib/output.ts` — `print(rows, format)` handles `json` / `yaml` / `table`. Table mode derives headers from `Object.keys(data[0])`, so list endpoints should return rows with consistent shapes.
- `src/lib/types.ts` — `OutputFormat`, `AppConfig`, `WorkspaceConfig`, and resource shapes (`Campaign`, `Canvas`, `Segment`).

### Conventions worth preserving

- ESM only: `"type": "module"` plus `NodeNext` module resolution. Relative imports must use the `.js` extension even from `.ts` files (e.g. `import { print } from "../lib/output.js"`).
- API keys are never read from config files — only from env vars named by `workspace.apiKeyEnv`. Don't introduce on-disk key storage until the v0.5+ keychain work lands.
- Workspace selection always flows through `resolveWorkspace(opts.workspace)`; don't read config directly inside command handlers.
- `lint` is just `tsc --noEmit`; there is no ESLint/Prettier config. Type errors are the lint signal.

## Skill package

`packages/skill/SKILL.md` defines the agent contract: confirm workspace + date range, prefer `--output json`, and for any future write commands preview the exact command and require confirmation before running. Reusable prompts live in `packages/skill/templates/` (`weekly-performance.md`, `segment-audit.md`, `release-checklist.md`). Keep the documented `braze ... --workspace <ws> --output json` command patterns in sync when CLI flags change.
