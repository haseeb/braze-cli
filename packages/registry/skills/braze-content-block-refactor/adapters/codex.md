# Codex Adapter — Braze Content Block Refactor

For each content block to update:

1. Run `braze_get_content_block` to see current content
2. Run `braze_plan_content_block` with new content — shows diff + returns token
3. Review diff — if acceptable, run `braze_apply_content_block` with the token
4. Log the change to audit trail

Never apply without reviewing the diff first.
