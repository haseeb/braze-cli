# Braze Copy Studio

A skill for generating and staging copy variants with draft tokens — safe for review before applying.

## Workflow

1. Define campaign goal, target audience, and desired tone
2. Run `braze_generate_copy` to produce draft variants
3. Review variants — each includes a rationale
4. Select preferred variants for staging
5. Use `braze_plan_content_block` / `braze_apply_content_block` to apply to content blocks

## MCP tools (requires --allow-writes)

- `braze_generate_copy` — Generate draft copy variants with token
- `braze_plan_content_block` — Stage copy into content blocks (diff preview)
- `braze_apply_content_block` — Apply staged copy with token

## Output

Each variant includes:
- Subject line
- Body copy
- Preview text
- Rationale for the approach
