# Segment Audit Prompt

Goal: identify cleanup opportunities and governance risks in `<workspace>`.

## Steps

1. Run `braze_list_segments` for the workspace
2. Flag segments with missing descriptions, stale naming conventions, or likely duplicates (near-identical names)
3. For high-impact candidates, run `braze_get_segment`
4. Produce a remediation table with columns: segment, issue, recommended action, estimated impact, owner
