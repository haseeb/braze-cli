# Weekly performance summary template

Goal: summarize campaign performance for `<workspace>` over the last 7 days, compared to the previous 28-day baseline.

## Steps

1. Run `braze campaigns list --workspace <workspace> --output json`.
2. Select top campaigns by send volume (or active priority campaigns if volume unavailable).
3. For each selected campaign, run `braze campaigns get <campaign_id> --workspace <workspace> --output json`.
4. Compute and flag anomalies:
   - CTR drop > 20% vs baseline
   - Failure/error rate > 2x baseline
   - Send volume swing > 30%
5. Produce a Slack-ready update with:
   - wins
   - risks
   - recommended experiments for next week
# Weekly performance summary

You are reviewing Braze campaign performance.

1. List campaigns for `<workspace>`.
2. Pull details for the top 5 campaigns by send volume.
3. Compare last 7 days vs previous 28-day baseline.
4. Flag anomalies: CTR drop >20%, failure rate >2x baseline.
5. Draft a Slack-ready summary with:
   - wins
   - risks
   - next actions
