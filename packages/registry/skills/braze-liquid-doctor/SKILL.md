# Braze Liquid Doctor

A skill for linting and previewing Braze Liquid templates.

## Workflow

1. Accept a Liquid template (from content block, email template, or direct input)
2. Run `braze_liquid_lint` to check for syntax errors and warnings
3. Optionally run `braze_liquid_preview` with sample data to see rendered output
4. Report issues with line numbers and severity levels
5. Suggest fixes for common problems

## MCP tools

- `braze_liquid_lint` — Check for syntax errors (mismatched braces, unclosed blocks, spacing issues)
- `braze_liquid_preview` — Preview rendered output with optional sample data

## Checks performed

- Mismatched `{{ }}` pairs
- Unclosed `{% if %}` / `{% for %}` blocks
- `{% endif %}` / `{% endfor %}` without matching openers
- Missing spaces around delimiters (warning)
- Excessively long expressions (warning)
