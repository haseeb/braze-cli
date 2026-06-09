# Braze Weekly Performance Report

A skill for generating weekly Braze performance summaries.

## Workflow

1. Confirm workspace and date range (default: last 7 days vs. prior 28-day baseline)
2. List campaigns and canvases using MCP tools
3. Pull details for top 5 campaigns by send volume
4. Flag anomalies: CTR drop >20%, failure rate >2x baseline
5. Draft a Slack-ready summary with wins, risks, and recommended actions

## Commands / MCP tools

- `braze_list_campaigns` — List all campaigns
- `braze_get_campaign` — Get campaign details
- `braze_list_canvases` — List all canvases
- `braze_get_canvas` — Get canvas details
- `braze_list_segments` — List all segments

## Output format

```
Weekly Performance Summary — <workspace>
Period: <date range>

Wins:
- <metric improvement>
- <successful campaign>

Risks:
- <anomaly flagged>
- <performance drop>

Actions:
- <recommended next step>
```
