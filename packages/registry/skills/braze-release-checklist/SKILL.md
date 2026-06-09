# Braze Release Checklist

A skill for validating Braze release readiness from staging to production.

## Workflow

1. Confirm release scope (campaign IDs, canvas IDs, segments, content blocks)
2. Export/list resources in staging using MCP tools
3. Compare against prod equivalents (if accessible)
4. Run `braze_plan_content_block` for pending copy changes (diff preview)
5. Generate go/no-go recommendation, blockers list, and post-release validation plan

## MCP tools

- `braze_list_campaigns`, `braze_get_campaign`
- `braze_list_canvases`, `braze_get_canvas`
- `braze_list_segments`, `braze_get_segment`
- `braze_list_content_blocks`, `braze_get_content_block`
- `braze_plan_content_block` (with --allow-writes for diff preview)

## Output

- Go/No-Go recommendation
- Blockers list (if any)
- Post-release validation checklist
