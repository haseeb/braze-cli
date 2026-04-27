# braze-cli

> Unofficial CLI and [Claude Code](https://claude.com/claude-code) agent skill for [Braze](https://braze.com). Manage campaigns, canvases, and segments from your terminal — or from natural language.

[![npm version](https://img.shields.io/npm/v/braze-cli.svg)](https://www.npmjs.com/package/braze-cli)
[![CI](https://github.com/<your-username>/braze-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/<your-username>/braze-cli/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Status:** Early development. v0.1 ships [date]. Watch the repo for releases.

## Why this exists

Braze powers customer engagement for thousands of companies, but its automation story is weak outside the in-app UI. The REST API is comprehensive but verbose, and there's no good open CLI. Every MarTech team rebuilds the same wrapper internally.

`braze-cli` covers the 80% of Braze workflows that should be a one-liner — listing campaigns, exporting canvases, auditing segments, bulk-updating content blocks. The included Claude Code skill takes it further: drive Braze from natural language ("summarize this week's campaign performance and post it in Slack").

Built by [Haseeb Tariq](https://www.linkedin.com/in/haseebtariq), Senior PM at T-Mobile, after attended Forge Braze.

## Install

```bash
npm install -g braze-cli
```

## Quick start

```bash
# Authenticate (stores key in OS keychain)
braze auth login --workspace prod

# List campaigns
braze campaigns list

# Export a canvas as JSON for git diff
braze canvas export <canvas-id> > canvas.json

# Bulk update content blocks from CSV
braze content-blocks bulk-update --from blocks.csv

# Switch workspaces
braze --workspace staging campaigns list
```

## What's included

| Resource | Read | Write |
|---|---|---|
| Campaigns | ✓ | trigger, schedule |
| Canvases | ✓ | trigger, import |
| Segments | ✓ | create, update |
| Content blocks | ✓ | create, update, bulk |
| Catalogs | ✓ | upload |
| Users | ✓ | alias, delete |
| Currents | validate | — |

Full reference at [docs.braze-cli.dev](#) *(coming soon)*.

## Claude Code skill

If you use [Claude Code](https://claude.com/claude-code), install the agent skill:

```bash
braze skill install
```

Then in Claude Code:

> *"Show me last week's underperforming campaigns and write a Slack summary I can post in #marketing-ops."*

> *"Audit our segments and tell me which ones haven't been used in 90 days."*

> *"Compare this canvas to its version from last month and explain what changed."*

The skill translates natural language into CLI commands and handles multi-step workflows.

## Authentication

`braze-cli` uses Braze REST API keys, stored securely in your OS keychain (macOS Keychain, Linux Secret Service, Windows Credential Manager). For CI environments, set `BRAZE_API_KEY` as an environment variable.

[Generate an API key in the Braze dashboard →](https://www.braze.com/docs/api/basics/#rest-api-key)

Each workspace has its own key. Switch with `--workspace <name>` or set a default in `~/.braze/config.yaml`.

## Roadmap

- **v0.1** *(target: [date])* — Auth, campaigns, canvases, segments (read)
- **v0.5** — Write operations, content blocks, catalogs, skill multi-step workflows
- **v1.0** — Full coverage, multi-workspace config, CI integration recipes

See [the full PRD](./docs/PRD.md) for context.

## Contributing

Issues, PRs, and feature requests welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

This project is **unofficial** and not affiliated with or endorsed by Braze, Inc. "Braze" is a trademark of Braze, Inc.

## License

MIT — see [LICENSE](./LICENSE).
