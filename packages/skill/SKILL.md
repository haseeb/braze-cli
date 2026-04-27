# braze-skill

A Claude Code skill for running Braze operations through `braze` CLI commands.

## Who this is for

- Lifecycle marketers
- Growth PMs
- MarTech engineers
- Partner consultants managing multiple Braze workspaces

## Core behavior

1. Confirm **workspace** and **date range** first.
2. Prefer read-only command execution with `--output json`.
3. Summarize results in business language (wins, risks, actions).
4. For mutating actions, present exact command(s) and require explicit approval.
5. Return an execution transcript for auditability.

## Command mapping

### Campaign reporting
- `braze campaigns list --workspace <ws> --output json`
- `braze campaigns get <campaign_id> --workspace <ws> --output json`

### Canvas auditing
- `braze canvases list --workspace <ws> --output json`
- `braze canvases get <canvas_id> --workspace <ws> --output json`

### Segment governance
- `braze segments list --workspace <ws> --output json`
- `braze segments get <segment_id> --workspace <ws> --output json`

### Content block maintenance
- `braze content-blocks list --workspace <ws> --output json`
- `braze content-blocks bulk-update --from <csv> --workspace <ws> --dry-run --output json`

## Output style

Always include these sections when answering:
1. **What I checked**
2. **What changed / what I found**
3. **Recommended next actions**
4. **Commands run (or proposed)**

## Templates

Use `templates/` prompts for:
- weekly performance (`weekly-performance.md`)
- segment audits (`segment-audit.md`)
- release validation (`release-checklist.md`)
