# Weekly Performance Summary Prompt

Goal: summarize campaign performance for `<workspace>` over the last 7 days, compared to the previous 28-day baseline.

## Steps

1. Run `braze_list_campaigns` for the workspace
2. Select top campaigns by send volume (or active priority campaigns if volume unavailable)
3. For each selected campaign, run `braze_get_campaign`
4. Compute and flag anomalies:
   - CTR drop > 20% vs baseline
   - Failure/error rate > 2x baseline
   - Send volume swing > 30%
5. Produce a Slack-ready update with wins, risks, and recommended experiments for next week
