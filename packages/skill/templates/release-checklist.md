# Release checklist template

Goal: validate Braze release readiness from staging to prod.

## Steps

1. Confirm release scope (campaign IDs, canvas IDs, segments, content blocks).
2. Export/list resources in staging.
3. Compare against prod equivalents.
4. Run `content-blocks bulk-update --dry-run` for pending copy changes.
5. Generate:
   - go/no-go recommendation
   - blockers list
   - post-release validation plan
