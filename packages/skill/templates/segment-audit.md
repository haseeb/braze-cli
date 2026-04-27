# Segment audit template

Goal: identify cleanup opportunities and governance risks in `<workspace>`.

## Steps

1. Run `braze segments list --workspace <workspace> --output json`.
2. Flag segments with:
   - missing descriptions
   - stale naming conventions
   - likely duplicates (near-identical names)
3. For high-impact candidates, run `braze segments get <segment_id> --workspace <workspace> --output json`.
4. Produce a remediation table with columns:
   - segment
   - issue
   - recommended action
   - estimated impact
   - owner
# Segment audit

1. List segments for `<workspace>`.
2. Identify segments with missing descriptions.
3. Identify likely duplicates by similar names.
4. Produce cleanup recommendations with impact and owner fields.
