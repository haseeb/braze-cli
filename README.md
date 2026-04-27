# braze-cli

A production-minded, terminal-first Braze toolkit for MarTech teams:

- **`@braze/cli`** → TypeScript CLI for core Braze workflows.
- **`braze-skill`** → Claude Code skill docs/templates for natural-language ops.

> This project is unofficial and not affiliated with Braze, Inc.

## What is implemented now

### CLI (v0.2 foundation)

- Workspace bootstrap and management:
  - `braze auth init`
  - `braze auth workspace-add`
  - `braze auth workspace-use`
  - `braze auth workspace-list`
- Auth methods:
  - Environment variable (`BRAZE_API_KEY` by default, configurable per workspace)
  - Optional keychain storage via `braze auth login` (uses `keytar` when available)
- Read commands:
  - `campaigns list|get`
  - `canvases list|get`
  - `segments list|get`
  - `content-blocks list|get`
- Write helper:
  - `content-blocks bulk-update --from <csv> [--dry-run]`
- Output modes: `table`, `json`, `yaml`.
- API client retries with exponential backoff for retryable status codes.

### Skill package

`packages/skill` contains a usable `SKILL.md` and reusable templates for:

- Weekly performance summaries
- Segment audits
- Release checklists

## Repo layout

```
braze-cli/
├── packages/
│   ├── cli/    # TypeScript CLI
│   └── skill/  # Claude Code skill files and prompt templates
├── docs/
└── examples/
```

## Quick start

```bash
npm install
npm run build

# initialize local config
node packages/cli/dist/index.js auth init

# add a workspace
node packages/cli/dist/index.js auth workspace-add \
  --workspace prod \
  --base-url https://rest.iad-01.braze.com

# optional: store key in OS keychain (if keytar available)
node packages/cli/dist/index.js auth login --workspace prod --api-key <BRAZE_KEY>

# list campaigns as json
BRAZE_API_KEY=<BRAZE_KEY> node packages/cli/dist/index.js campaigns list --workspace prod --output json
```

## Bulk content block update CSV format

Use headers: `id,content`

```csv
id,content
block_123,"Hello {{${first_name | default: 'there'}}}"
block_124,"Spring offer copy"
```

Run a safe preview first:

```bash
node packages/cli/dist/index.js content-blocks bulk-update --from ./blocks.csv --workspace prod --dry-run --output table
```

Then apply:

```bash
BRAZE_API_KEY=<BRAZE_KEY> node packages/cli/dist/index.js content-blocks bulk-update --from ./blocks.csv --workspace prod
```

## Status and next milestones

- This release is aimed at **high-confidence operational scaffolding**.
- Next expansion targets: campaigns/canvases write operations, users/catalogs, currents validation, CI recipes.

## License

MIT
