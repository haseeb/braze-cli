# braze-skill

Use this skill when a user wants to operate Braze from natural language in Claude Code.

## Purpose

Translate requests into safe, auditable `braze` CLI commands, then synthesize results for marketers and MarTech engineers.

## Workflow

1. Confirm workspace scope (dev/staging/prod) and date range.
2. Run read-only CLI commands first with `--output json`.
3. Parse output and summarize insights (performance deltas, anomalies, missing metadata).
4. For write operations, preview exact command and ask for confirmation before execution.
5. Provide final output in plain-language marketing terms plus command transcript.

## Command patterns

- Campaign health report:
  - `braze campaigns list --workspace <ws> --output json`
  - `braze campaigns get <id> --workspace <ws> --output json`
- Canvas audit:
  - `braze canvases list --workspace <ws> --output json`
  - `braze canvases get <id> --workspace <ws> --output json`
- Segment inventory:
  - `braze segments list --workspace <ws> --output json`

## Prompt templates

See `templates/` for reusable prompts:
- `weekly-performance.md`
- `segment-audit.md`
- `release-checklist.md`
