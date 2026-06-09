# Braze Decisioning Studio Setup

A skill for scaffolding Decisioning Studio experiments.

## Workflow

1. Define experiment name, goal, target audience, and variant names
2. Run `braze_decisioning_scaffold` to generate variant structure
3. Review variant settings (randomization unit, metric, audience)
4. Adjust variants as needed
5. Export scaffold as a reviewable plan for implementation

## MCP tools (requires --allow-writes)

- `braze_decisioning_scaffold` — Generate experiment scaffold with variants
- `braze_generate_copy` — Generate draft copy for each variant
- `braze_optimization_audit` — Pre-launch audit of affected campaigns

## Output

- Experiment name and settings
- Variants with draft content
- Summary and next steps
