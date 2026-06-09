# Braze Segment Audit

A skill for auditing Braze segment hygiene and governance.

## Workflow

1. List all segments for the workspace
2. Flag segments with missing descriptions, stale names, or likely duplicates
3. For high-impact candidates, pull full segment details
4. Produce a remediation table with segment name, issue, recommendation, impact, and owner

## MCP tools

- `braze_list_segments` — List all segments
- `braze_get_segment` — Get segment details

## Output format

| Segment | Issue | Recommendation | Impact | Owner |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |
