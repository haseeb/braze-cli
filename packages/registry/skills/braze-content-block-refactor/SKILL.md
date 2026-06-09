# Braze Content Block Refactor

A skill for planning, reviewing, and applying bulk content block changes with safety gates.

## Workflow

1. List all content blocks and identify candidates for update
2. For each block, plan the update with `braze_plan_content_block`
3. Review diffs and approve/reject each plan
4. Apply approved plans with `braze_apply_content_block`
5. Verify changes and log audit trail

## MCP tools (requires --allow-writes)

- `braze_list_content_blocks` — List all content blocks
- `braze_get_content_block` — Get content block details
- `braze_plan_content_block` — Plan update (shows diff, returns token)
- `braze_apply_content_block` — Apply planned update with token

## Safety

- All changes go through plan → review → approve → apply
- Each plan has a unique confirmation token
- Invalid or reused tokens are rejected
- Audit log records all applied changes
