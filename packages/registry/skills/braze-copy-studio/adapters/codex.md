# Codex Adapter — Braze Copy Studio

1. Ask for: campaign goal, target audience, desired tone
2. Run `braze_generate_copy` with those parameters
3. Present variants to user for review
4. For selected variants, plan and apply to content blocks using `braze_plan_content_block` / `braze_apply_content_block`

All output is draft-staged until explicitly applied.
