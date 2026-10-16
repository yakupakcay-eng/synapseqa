# SynapseQA

[![CI](https://github.com/yakupakcay-eng/synapseqa/actions/workflows/ci.yml/badge.svg)](https://github.com/yakupakcay-eng/synapseqa/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Browser QA driven by Claude's computer use tool.** Describe a user journey in plain English; the agent drives a real
Chromium browser from screenshots and reports `VERDICT: PASS` or `VERDICT: FAIL` with what it saw. No CSS/XPath selectors.

Early-stage, open source. Site: <https://www.synapseqa.me> &middot; Contact: founder@synapseqa.me

## How it works

```
Playwright (headless Chromium)  <->  Claude Messages API
                                     model: claude-sonnet-5-5
                                     tools: [{"type": "computer_toolset_20260801"}]
```

1. Chromium opens the target page in a fixed viewport.
2. Claude receives the goal and answers with `tool_use` blocks (`screenshot`, `left_click`, `type`, `scroll`, ...).
3. We run each action in the browser and reply with a `tool_result` that contains a fresh screenshot.
4. When Claude stops calling tools it writes a report ending in `VERDICT: PASS|FAIL`.

The system prompt is identical on every turn, so it carries `cache_control: {"type": "ephemeral"}`. Token usage,
including `cache_read_input_tokens`, is read from the API response and returned with each run. Code: [`agent/computer_use.py`](agent/computer_use.py).

## Run it

```bash
git clone https://github.com/yakupakcay-eng/synapseqa && cd synapseqa
pip install -r agent/requirements.txt && playwright install chromium
export ANTHROPIC_API_KEY=sk-ant-...      # PowerShell: $env:ANTHROPIC_API_KEY="sk-ant-..."
node cli/bin/synapseqa.js --target=https://example.com --goal="Smoke-test the sign-up flow"
```

Without `ANTHROPIC_API_KEY` the agent performs a **dry run**: it states that no model was called and nothing was tested.
Exit codes: `0` PASS/DRY_RUN, `1` FAIL/INCONCLUSIVE, `2` error.

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
| Multi-turn loop with full message history (tool_use / tool_result) | Benchmarks on real apps (accuracy, cost, latency, flakiness are **not measured**) |
| Browser action dispatcher (click, type, key, scroll, wait) | Repo-aware defect localisation |
| CLI with CI-friendly exit codes | Hosted runner, parallel runs, trace viewer |
| Offline tests run in CI | `agent/github_pr.py` opens a PR from a model-proposed patch; implemented but not yet run against a live repo |

The interactive panel on the website is a **scripted illustration**, not a live model run.

## License

[MIT](LICENSE) &copy; 2026 Yakup Ak&ccedil;ay
