# braze-oss

An **unofficial**, open-source Braze toolkit built for cloud coding agents and
terminal-first MarTech teams. It ships three coordinated deliverables from one
TypeScript monorepo:

- **`@braze-oss/mcp`** — a Braze **MCP server** (stdio **and** HTTP/SSE) that
  connects from Claude Code on the web, Codex, Goose, Cursor, and other agent
  harnesses. Read tools are always on; change and AI tools are gated behind an
  explicit `--allow-writes` flag.
- **`@braze/cli`** — a TypeScript CLI for everyday Braze workflows (read,
  bulk content-block updates, Liquid lint/preview, optimization audit, weekly
  insights).
- **Open Skills Registry + `@braze-oss/installer`** — a portable catalog of
  Braze "skill packs" you can install into multiple harnesses with one command.

All three share **`@braze-oss/core`**, so the CLI and MCP server never drift.

> This project is unofficial and not affiliated with Braze, Inc. It complements
> Braze's own MCP server with cloud-first ergonomics, safe-by-default change
> workflows, an AI-feature focus, and a portable multi-harness skills ecosystem.

## Repository layout

```
braze-cli/
├── packages/
│   ├── core/       # shared Braze client, config, auth, redaction, audit,
│   │               # change engine, Liquid, and AI tools
│   ├── cli/        # @braze/cli — terminal CLI
│   ├── mcp/        # @braze-oss/mcp — MCP server (stdio + HTTP) + client configs
│   ├── installer/  # @braze-oss/installer — cross-harness skills installer
│   ├── registry/   # @braze-oss/registry — Open Skills Registry + JSON Schema
│   └── skill/      # original Claude Code skill templates
├── docs/           # PRDs
└── examples/
```

## Safety model

- **Read-only by default.** The MCP server only exposes change/AI tools when
  launched with `--allow-writes`.
- **Every write is planned, then applied.** `braze_plan_content_block` returns a
  human-readable diff plus a confirmation token; `braze_apply_content_block`
  refuses to run without that token.
- **Non-PII invariant.** Responses pass through a redaction layer before they
  reach an LLM.
- **Auditable.** Every API call is logged (operation, workspace, status,
  duration) without secrets.
- **Rollback.** Applied content-block changes can be rolled back where the API
  allows.

## Quick start

```bash
npm install
npm run build
npm test
```

### 1. Use the CLI

```bash
# initialize local config (~/.braze/config.yaml)
node packages/cli/dist/index.js auth init

# add a workspace
node packages/cli/dist/index.js auth workspace-add \
  --workspace prod --base-url https://rest.iad-01.braze.com

# read commands (API key via env or OS keychain)
BRAZE_API_KEY=*** node packages/cli/dist/index.js campaigns list --workspace prod --output json

# Liquid tooling (no API key needed)
node packages/cli/dist/index.js liquid lint --template 'Hi {{first_name | default: "there"}}'
node packages/cli/dist/index.js liquid preview --template 'Hi {{name}}' --data '{"name":"Sam"}'

# optimization audit + weekly insights
BRAZE_API_KEY=*** node packages/cli/dist/index.js audit --workspace prod
BRAZE_API_KEY=*** node packages/cli/dist/index.js insights weekly --workspace prod
```

Bulk content-block update (always dry-run first):

```bash
# CSV headers: id,content
node packages/cli/dist/index.js content-blocks bulk-update --from ./blocks.csv --workspace staging --dry-run
BRAZE_API_KEY=*** node packages/cli/dist/index.js content-blocks bulk-update --from ./blocks.csv --workspace staging
```

### 2. Run the MCP server

```bash
# local stdio (read-only)
node packages/mcp/dist/index.js --transport stdio

# cloud HTTP, with change + AI tools enabled
BRAZE_MCP_API_KEY=choose-a-bearer-token \
  node packages/mcp/dist/index.js --transport http --allow-writes
```

Environment variables:

| Variable | Purpose |
|---|---|
| `BRAZE_API_KEY` | Braze REST API key used to call Braze |
| `BRAZE_WORKSPACE` | Default workspace name (defaults to `dev`) |
| `BRAZE_MCP_API_KEY` | Bearer token required on the HTTP transport (auth is disabled if unset) |
| `BRAZE_MCP_HOST` / `BRAZE_MCP_PORT` | HTTP bind address (defaults `127.0.0.1:3000`) |

Ready-to-paste client configs live in `packages/mcp/configs/` for Claude Code
(`claude-code.json`), Claude Desktop, Codex, Cursor, and Goose. Example for
Claude Code:

```json
{
  "mcpServers": {
    "braze-oss": {
      "command": "npx",
      "args": ["@braze-oss/mcp"],
      "env": { "BRAZE_API_KEY": "${BRAZE_API_KEY}", "BRAZE_WORKSPACE": "${BRAZE_WORKSPACE}" }
    }
  }
}
```

#### MCP tool catalog

Read tools (always available): `braze_list_campaigns`, `braze_get_campaign`,
`braze_list_canvases`, `braze_get_canvas`, `braze_list_segments`,
`braze_get_segment`, `braze_list_content_blocks`, `braze_get_content_block`,
`braze_list_email_templates`, `braze_get_email_template`, `braze_liquid_lint`,
`braze_liquid_preview`.

Change + AI tools (require `--allow-writes`): `braze_plan_content_block`,
`braze_apply_content_block`, `braze_generate_copy`, `braze_optimization_audit`,
`braze_weekly_insights`, `braze_decisioning_scaffold`.

### 3. Install skills into your harness

```bash
# list the catalog
node packages/installer/dist/index.js skills list

# install into Claude Code (default), Codex, Goose, or generic
node packages/installer/dist/index.js skills add braze-weekly-report --harness claude-code
node packages/installer/dist/index.js skills add braze-weekly-report --harness codex --dry-run

# update / remove
node packages/installer/dist/index.js skills update braze-weekly-report
node packages/installer/dist/index.js skills remove braze-weekly-report --harness claude-code
```

Seed skills: `braze-weekly-report`, `braze-segment-audit`,
`braze-release-checklist`, `braze-content-block-refactor`, `braze-copy-studio`,
`braze-liquid-doctor`, `braze-decisioning-setup`. Harnesses with no dedicated
adapter fall back to the `generic` prompt format.

## Contributing a skill

1. Add `packages/registry/skills/<your-skill-id>/` with a `skill.json`
   (validated against `packages/registry/schema/skill.schema.json`), a
   `SKILL.md`, and optional `prompts/` and `adapters/` files.
2. Run `npm run generate-index` to refresh `packages/registry/index.json`.
3. CI validates every manifest and fails if the index is stale.

## Development

```bash
npm run lint     # type-check every package
npm test         # run all unit + integration tests
npm run build    # compile all packages to dist/
```

CI (`.github/workflows/ci.yml`) runs lint, test, and build on Node 20 and 22,
plus a registry-integrity job.

## License

MIT
