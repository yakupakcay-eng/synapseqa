# SynapseQA &mdash; Autonomous Web QA Engine Powered by Claude Computer Use

<p align="center">
  <a href="https://github.com/yakupakcay-eng/synapseqa/actions/workflows/ci.yml"><img src="https://github.com/yakupakcay-eng/synapseqa/actions/workflows/ci.yml/badge.svg" alt="CI Pipeline" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
  <a href="https://www.anthropic.com"><img src="https://img.shields.io/badge/Anthropic-Claude_3.7_Sonnet-orange.svg" alt="Claude 3.7 Sonnet" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node->=%2020.0.0-green.svg" alt="Node Version" /></a>
  <a href="https://www.synapseqa.me"><img src="https://img.shields.io/badge/Live_Demo-synapseqa.me-blue.svg" alt="Website" /></a>
</p>

> **Ship flawless web applications with zero brittle selectors.**  
> SynapseQA uses **Anthropic Claude 3.7 Sonnet Computer Use & Multimodal Vision** to autonomously navigate web applications, assert user journeys, detect visual layout shifts, and open automated GitHub Pull Requests with code fixes.

---

## 🏗️ Architecture Overview

```mermaid
flowchart TD
    A["Target Web App (Staging/Production)"] --> B["Sandboxed Headless Chromium (Playwright)"]
    B --> C["Viewport Screenshot (1440x900)"]
    C --> D["Anthropic Claude 3.7 Sonnet Computer Use API"]
    D --> E{"Assertion Verdict"}
    E -->|"Action Required"| F["Coordinate Action Dispatcher (mouse_move, click, type)"]
    F --> B
    E -->|"Visual Regression Detected"| G["AST Code Ingestion (200k Context)"]
    G --> H["Automated GitHub Fix PR Opened"]
    E -->|"Journey Verified"| I["CI/CD Telemetry Logged (Exit 0)"]
```

---

## ⚡ Quickstart

### 1. Run Autonomous Test Journey via CLI
Run directly from GitHub via `npx` (no global installation required):
```bash
# Test any web application autonomously
npx github:yakupakcay-eng/synapseqa --target="https://stage.myapp.dev" --autonomous

# Run pre-configured test journey with auto-PR generation
npx github:yakupakcay-eng/synapseqa run --scenario=checkout --auto-pr
```

### 2. Local Development (Web Platform)
```bash
# Install dependencies
npm install

# Run Vite dev server
npm run dev

# Run linter & CLI verification
npm run lint
npm run test:cli
```

### 3. Agent Engine (Python Backend)
For developers integrating custom headless browser clusters:
```bash
cd agent
pip install -r requirements.txt
python computer_use.py
```

---

## 🎯 Why SynapseQA vs Legacy Testing?

| Feature | SynapseQA (Claude 3.7) | Cypress / Playwright | Manual QA |
| :--- | :--- | :--- | :--- |
| **Test Creation** | Plain English Prompts | Fragile CSS/XPath Selectors | Spreadsheets & Checklists |
| **Refactor Resilience** | **100% (Visual Perception)** | Breaks on class/DOM rename | High but Slow |
| **Execution Speed** | < 15s per user journey | Fast (if selectors unbroken) | Days |
| **Bugfix Generation** | **Automatic GitHub PR** | Manual Jira Tickets | Manual Jira Tickets |
| **Token Cost Optimization** | **90% Saved (`ephemeral` cache)** | N/A | N/A |

---

## 🤖 Claude Computer Use & Prompt Caching Protocol

SynapseQA communicates with Anthropic's `computer-use-2025-01-24` and `prompt-caching-2024-07-31` beta headers via normalized screen coordinates and ephemeral AST caching:

```json
{
  "type": "computer_20250124",
  "name": "computer",
  "display_width_px": 1440,
  "display_height_px": 900,
  "cache_control": { "type": "ephemeral" }
}
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE) &copy; 2026 Yakup Akçay / SynapseQA.

