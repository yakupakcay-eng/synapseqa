# SynapseQA

[![CI](https://github.com/yakupakcay-eng/synapseqa/actions/workflows/ci.yml/badge.svg)](https://github.com/yakupakcay-eng/synapseqa/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Browser QA driven by Claude's computer use tool.** Describe a user journey in plain English; the agent drives a real
Chromium browser from screenshots and reports `VERDICT: PASS` or `VERDICT: FAIL` with what it saw. No CSS/XPath selectors.

Early-stage, open source. Site: <https://www.synapseqa.me> &middot; Contact: founder@synapseqa.me

## Who it is for

Small teams that ship a web UI but have no one writing and maintaining a full end-to-end suite. The goal is a cheap
"does the main journey still work and does it look right?" check you describe in one sentence, run on a preview
deploy or in CI, next to (not instead of) deterministic Playwright/Cypress tests.

## How it works

```
Playwright (headless Chromium)  <->  Claude Messages API
                                     model: claude-sonnet-5-5
                                     tools: [{"type": "computer_toolset_20260801"}]
```

1. Chromium opens the target page in a fixed viewport.
2. Claude receives the goal and answers with `tool_use` blocks (`screenshot`, `left_click`, `type`, `scroll`, ...).
3. We run each action in the browser and reply with a `tool_result` (a short `OK`, or a screenshot when Claude asks for one).
4. When Claude stops calling tools it writes a report ending in `VERDICT: PASS|FAIL`.

The system prompt carries `cache_control: {"type": "ephemeral"}`. Token usage, including cache creation and read counts,
is read from the API response and returned with each run. Code: [`agent/computer_use.py`](agent/computer_use.py).

## What a result looks like

Shape of the JSON a run prints (an **illustration of the format**, not output from a real run):

```json
{
  "target": "https://example.com",
  "model": "claude-sonnet-5-5",
  "goal": "Smoke-test the sign-up flow",
  "status": "FAIL",
  "steps": [
    {"index": 1, "tool": "screenshot", "input": {}, "error": null},
    {"index": 2, "tool": "left_click", "input": {"coordinate": [640, 412]}, "error": null}
  ],
  "report": "The Sign up button is partly covered by the cookie bar...
VERDICT: FAIL",
  "usage": {"input_tokens": 0, "output_tokens": 0, "cache_creation_input_tokens": 0,
            "cache_read_input_tokens": 0, "cache_read_ratio": null}
}
```

## Run it

Install from source: clone the repo and run from its root.

```bash
git clone https://github.com/yakupakcay-eng/synapseqa && cd synapseqa
pip install -r agent/requirements.txt && playwright install chromium
export ANTHROPIC_API_KEY=sk-ant-...      # PowerShell: $env:ANTHROPIC_API_KEY="sk-ant-..."
node cli/bin/synapseqa.js --target=https://example.com --goal="Smoke-test the sign-up flow"
```

Without `ANTHROPIC_API_KEY` the run stops with exit code `2` and says nothing was tested, so a CI job cannot go green by accident. `--dry-run` skips the model on purpose.
Exit codes: `0` PASS or `--dry-run`, `1` FAIL/INCONCLUSIVE, `2` error (including a missing key).

Python:

```python
import asyncio
from agent.computer_use import SynapseAgent

result = asyncio.run(SynapseAgent().run_audit("https://example.com", "Smoke-test the sign-up flow"))
print(result["status"], result["report"])
```

Security: every step sends a screenshot to the Anthropic API. Run in a throwaway VM/container, avoid pages with sensitive
data, and follow Anthropic's computer use security guidance.

## Tests

```bash
cd agent && python -m unittest -v     # offline: scripted fake Claude client + fake page, no network
npm ci && npm run lint && npm run build   # website
```

## Status

| In the repo today | Not done yet |
| :--- | :--- |
| Multi-turn loop with full message history (tool_use / tool_result); offline tests enforce the API's `toolset_name` rule | Benchmarks on real apps (accuracy, cost, latency, flakiness are **not measured**; a full run against a live model has not been recorded yet) |
| Browser action dispatcher (click, type, key, scroll, wait) | Repo-aware defect localisation |
| CLI with CI-friendly exit codes | Hosted runner, parallel runs, trace viewer |
| Offline tests run in CI | `agent/github_pr.py` opens a PR from a model-proposed patch; implemented but not yet run against a live repo |

The interactive panel on the website is a **scripted illustration**, not a live model run.

## License

[MIT](LICENSE) &copy; 2026 Yakup Ak&ccedil;ay
