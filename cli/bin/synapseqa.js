#!/usr/bin/env node

/**
 * SynapseQA CLI: a thin launcher for the Python agent in ../../agent/computer_use.py.
 * It runs the real agent loop (Playwright + Claude computer use) and forwards the exit code:
 *   0 = PASS or DRY_RUN, 1 = FAIL / INCONCLUSIVE, 2 = error.
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const VERSION = '1.4.0';
const args = process.argv.slice(2);
const agentScript = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../agent/computer_use.py');

if (args.includes('--version') || args.includes('-v')) {
  console.log(`synapseqa ${VERSION}`);
  process.exit(0);
}

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`synapseqa ${VERSION} - Claude-driven browser QA agent

Usage:
  node cli/bin/synapseqa.js --target=<url> [--goal="<what to test>"] [--max-steps=12] [--model=claude-sonnet-5-5] [--dry-run]

Setup (once):
  pip install -r agent/requirements.txt && playwright install chromium
  export ANTHROPIC_API_KEY=...        # PowerShell: $env:ANTHROPIC_API_KEY="..."

Without ANTHROPIC_API_KEY the agent does a dry run: no model call, nothing is tested.`);
  process.exit(0);
}

const candidates = process.platform === 'win32' ? ['python', 'py'] : ['python3', 'python'];
for (const python of candidates) {
  const result = spawnSync(python, [agentScript, ...args], { stdio: 'inherit' });
  if (result.error && result.error.code === 'ENOENT') continue;
  process.exit(result.status ?? 2);
}

console.error('synapseqa: Python 3.10+ is required but was not found on PATH.');
process.exit(2);
