import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Terminal,
  Cpu,
  Eye,
  GitPullRequest,
  Sparkles,
  Layers,
  Code2,
  Check,
  RefreshCw,
  MousePointer,
  HelpCircle,
  Copy,
  Circle
} from 'lucide-react';

const REPO_URL = 'https://github.com/yakupakcay-eng/synapseqa';
const CONTACT_EMAIL = 'founder@synapseqa.me';
const MODEL_ID = 'claude-sonnet-5-5';
const TOOLSET_ID = 'computer_toolset_20260801';

// Scripted walkthroughs: they illustrate what a run looks like. They are NOT live model output.
const scenarios = {
  checkout: {
    steps: [
      { title: 'screenshot', detail: 'Agent looks at the loaded cart page before acting.' },
      { title: 'left_click → promo field', detail: 'Clicks the promo input found visually at the pixel coordinates it chose.' },
      { title: 'type "SPRING25"', detail: 'Types the code, then clicks Apply.' },
      { title: 'screenshot → compare', detail: 'Reads the new total on screen and checks it against the expected discount.' },
      { title: 'Report: VERDICT: PASS', detail: 'Plain-text report with the evidence it observed.', done: true }
    ]
  },
  layout: {
    steps: [
      { title: 'screenshot @ 390x844', detail: 'Mobile-sized viewport, same page.' },
      { title: 'scroll → bottom', detail: 'Scrolls to the checkout footer.' },
      { title: 'screenshot → defect noticed', detail: 'The primary button is partly hidden behind the fixed bottom bar.', warn: true },
      { title: 'Report: VERDICT: FAIL', detail: 'Describes the clipped button so a human can fix it.', done: true }
    ]
  }
};

const quickstarts = {
  run: {
    label: 'Run the agent',
    code: `git clone ${REPO_URL} && cd synapseqa
pip install -r agent/requirements.txt && playwright install chromium
export ANTHROPIC_API_KEY=sk-ant-...
node cli/bin/synapseqa.js --target=https://example.com --goal="Smoke-test the sign-up flow"`
  },
  python: {
    label: 'Python',
    code: `import asyncio
from agent.computer_use import SynapseAgent

result = asyncio.run(
    SynapseAgent().run_audit("https://example.com", "Smoke-test the sign-up flow")
)
print(result["status"], result["report"])`
  }
};

const works = [
  'Multi-turn agent loop: screenshot → tool_use → tool_result, with full message history',
  'Browser action dispatcher on headless Chromium (click, type, key, scroll, wait)',
  'CLI launcher with PASS / FAIL exit codes for CI',
  'Offline unit tests with a scripted fake Claude client, run in CI',
  'No silent passes: a missing API key exits 2, and a PASS with zero browser actions counts as inconclusive'
];
const planned = [
  'Benchmarks on real apps: accuracy, cost per run, latency (not measured yet)',
  'Repo-aware diagnosis: feed source files to Claude to localise the defect',
  'PR creation from a model-proposed patch is implemented but not yet run on a live repo',
  'Hosted runner and parallel runs',
  'Trace and replay viewer'
];

export default function App() {
  const [selectedScenario, setSelectedScenario] = useState('checkout');
  const [isRunning, setIsRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [telemetryTab, setTelemetryTab] = useState('stream');
  const [quickstartTab, setQuickstartTab] = useState('run');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [projectInput, setProjectInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const steps = scenarios[selectedScenario].steps;

  useEffect(() => {
    if (!isRunning) return undefined;
    const timer = setTimeout(() => {
      if (stepIndex < steps.length - 1) setStepIndex((i) => i + 1);
      else setIsRunning(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, [isRunning, stepIndex, steps.length]);

  const pickScenario = (key) => {
    setSelectedScenario(key);
    setStepIndex(-1);
    setIsRunning(false);
  };

  const runWalkthrough = () => {
    setStepIndex(0);
    setIsRunning(true);
  };

  const copyQuickstart = () => {
    navigator.clipboard.writeText(quickstarts[quickstartTab].code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const submitEarlyAccess = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent('SynapseQA early access');
    const body = encodeURIComponent(`Email: ${emailInput}\nProject / repo: ${projectInput || '-'}\n\nWhat I would like to test:\n`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setIsModalOpen(false);
  };

  const pill = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/15 bg-white/[0.06] text-zinc-200 text-[11px] font-mono font-semibold uppercase tracking-wider mb-3';
  const primaryBtn = 'text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 rounded border border-transparent transition-all flex items-center gap-1.5 cursor-pointer';

  return (
    <div className="min-h-screen bg-[#111418] text-zinc-100 selection:bg-white/[0.06] selection:text-zinc-200">
      {/* Banner */}
      <div className="relative z-50 border-b border-white/[0.07] bg-zinc-950/80  px-4 py-2 text-center text-xs font-medium text-zinc-300 flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/15 text-[10px] text-zinc-200 font-semibold tracking-wider uppercase">
          <Sparkles className="w-3 h-3 text-zinc-200" /> Early stage &bull; Open source
        </span>
        <span>Agent loop on the Claude Messages API using the <code className="font-mono text-zinc-200">{TOOLSET_ID}</code> computer use toolset.</span>
        <a href={REPO_URL} target="_blank" rel="noreferrer" className="ml-1 text-zinc-200 hover:text-zinc-200 font-semibold underline underline-offset-4 transition-colors">
          Read the code &rarr;
        </a>
      </div>

      {/* Header */}
      <header className="relative z-40 border-b border-white/[0.07] bg-[#111418]/80  sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-zinc-100 flex items-center justify-center border border-white/20">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              Synapse<span className="text-zinc-200">QA</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-white/10 font-mono">v1.4.0</span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-400">
            <a href="#who" className="hover:text-white transition-colors">Who it is for</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#walkthrough" className="hover:text-white transition-colors">Walkthrough</a>
            <a href="#status" className="hover:text-white transition-colors">Status</a>
            <a href="#why-claude" className="hover:text-white transition-colors">Why Claude</a>
            <button onClick={() => setIsDocsOpen(true)} className="hover:text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer text-zinc-300">
              <Code2 className="w-3.5 h-3.5 text-zinc-200" /> Docs
            </button>
          </nav>

          <button onClick={() => setIsModalOpen(true)} className={primaryBtn}>
            Request early access <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-zinc-900/80  text-xs font-medium mb-8">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-zinc-400">Open source &middot; MIT</span>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-200 font-semibold">Selector-free browser testing</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-extrabold tracking-[-0.035em] text-white max-w-4xl mx-auto leading-[1.06]">
          QA that reads the screen{' '}
          <span className="text-white">
            the way a user does.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          SynapseQA lets Claude drive a real browser from screenshots. You describe a journey in plain English;
          the agent clicks, types and scrolls, then reports PASS or FAIL with what it saw. No CSS or XPath selectors to maintain.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="px-6 py-3 rounded bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-sm border border-transparent flex items-center gap-2 transition-all">
            View on GitHub <ArrowRight className="w-4 h-4" />
          </a>
          <a href="#walkthrough" className="px-6 py-3 rounded border border-white/10 hover:border-white/20 bg-zinc-900/70 hover:bg-zinc-800/80 text-zinc-200 font-medium text-sm flex items-center gap-2 transition-all surface-glass">
            <Play className="w-3.5 h-3.5 text-zinc-200 fill-zinc-200" /> See a walkthrough
          </a>
        </div>

        {/* Quickstart */}
        <div className="mt-12 max-w-3xl mx-auto rounded-md border border-white/10 surface-glass overflow-hidden text-left">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.07] bg-black/40 text-[11px]">
            <div className="flex items-center gap-1">
              {Object.entries(quickstarts).map(([key, q]) => (
                <button
                  key={key}
                  onClick={() => setQuickstartTab(key)}
                  className={`px-2.5 py-1 rounded-md font-mono transition-colors cursor-pointer ${quickstartTab === key ? 'bg-white/[0.06] text-zinc-200 border border-white/15 font-semibold' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  {q.label}
                </button>
              ))}
            </div>
            <span className="text-zinc-500 font-mono text-[10px]">Node &gt;= 20 &bull; Python 3.10+ &bull; needs your own ANTHROPIC_API_KEY</span>
          </div>
          <div className="p-4 font-mono text-xs flex items-start justify-between gap-3 bg-black/50">
            <pre className="text-zinc-200 whitespace-pre overflow-x-auto leading-relaxed"><span className="text-zinc-200 select-none">$ </span>{quickstarts[quickstartTab].code}</pre>
            <button
              onClick={copyQuickstart}
              className="p-2 rounded border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer text-[11px]"
              title="Copy snippet"
            >
              {copiedCode ? (
                <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400 font-sans font-medium">Copied</span></>
              ) : (
                <><Copy className="w-3.5 h-3.5" /><span className="font-sans font-medium">Copy</span></>
              )}
            </button>
          </div>
        </div>

        {/* Facts (things that are true of the repository, not marketing metrics) */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          {[
            ['Model', MODEL_ID],
            ['Tool', TOOLSET_ID],
            ['Browser', 'Playwright Chromium'],
            ['License', 'MIT']
          ].map(([label, value]) => (
            <div key={label} className="p-4 rounded-md border border-white/[0.08] surface-glass">
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">{label}</div>
              <div className="text-sm font-semibold text-white mt-1 font-mono break-all">{value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.07]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className={pill}>How it works</div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">One loop, four moving parts</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            ['01', 'Browser', 'Headless Chromium opens your page in a fixed viewport via Playwright.', 'text-zinc-400'],
            ['02', 'Perceive', 'A screenshot goes to Claude with the computer use toolset. Claude answers with tool_use blocks.', 'text-zinc-400'],
            ['03', 'Act', 'We execute each action (click, type, scroll) and return a tool_result. Claude asks for a screenshot when it needs to see the page.', 'text-zinc-400'],
            ['04', 'Report', 'When Claude stops calling tools it writes a report ending in VERDICT: PASS or FAIL. The CLI exits 0 or 1.', 'text-zinc-400']
          ].map(([n, title, text, color]) => (
            <div key={n} className="p-5 rounded-md border border-white/[0.08] surface-glass">
              <div className={`text-[11px] font-mono font-bold mb-2 ${color}`}>STEP {n}</div>
              <h3 className="text-sm font-bold text-white mb-1.5">{title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who it is for */}
      <section id="who" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-white/[0.07]">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className={pill}>Who it is for</div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">Small teams with a UI and no E2E suite</h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            Most small teams ship a web app without anyone owning end-to-end tests. SynapseQA is a cheap
            &ldquo;does the main journey still work, and does it look right?&rdquo; check you write in one sentence and run on a preview
            deploy or in CI, next to your deterministic tests rather than instead of them.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {[
            ['The problem', 'Hand-written selector tests are costly to write and break on every UI refactor, so small teams skip them and find regressions in production.'],
            ['The approach', 'Describe a journey in plain English. Claude looks at real screenshots, acts, and reports PASS or FAIL with evidence. No selectors to maintain.'],
            ['The limits', 'It is slower and less deterministic than scripted tests, and costs a model call per step. Good for smoke and visual checks, not a regression suite.']
          ].map(([title, text]) => (
            <div key={title} className="p-5 rounded-md border border-white/[0.08] surface-glass">
              <h3 className="text-sm font-bold text-white mb-1.5">{title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-md border border-white/10 surface-glass overflow-hidden text-left">
          <div className="px-4 py-2 border-b border-white/[0.07] bg-black/40 text-[11px] font-mono text-zinc-400">
            Result format &mdash; an illustration of the shape, not output from a real run
          </div>
          <pre className="p-4 bg-black/50 font-mono text-[11px] text-zinc-300 overflow-x-auto leading-relaxed">{`{
  "target": "https://example.com",
  "status": "FAIL",
  "steps": [
    {"index": 1, "tool": "screenshot", "error": null},
    {"index": 2, "tool": "left_click", "input": {"coordinate": [640, 412]}}
  ],
  "report": "The Sign up button is partly covered by the cookie bar...\\nVERDICT: FAIL",
  "usage": {"input_tokens": 0, "cache_read_input_tokens": 0}
}`}</pre>
        </div>
      </section>

      {/* Walkthrough */}
      <section id="walkthrough" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.07]">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className={pill}><Cpu className="w-3.5 h-3.5" /> Scripted walkthrough</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">What a run looks like</h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            This panel is a scripted illustration, not a live model call. To see real traces, run the open-source agent with your own key.
          </p>
        </div>

        <div className="rounded-md border border-white/10 surface-elevated overflow-hidden">
          <div className="border-b border-zinc-800 bg-zinc-900/70 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded border border-zinc-800 text-xs">
              {[['checkout', 'Checkout flow'], ['layout', 'Layout defect (mobile)']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => pickScenario(key)}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${selectedScenario === key ? 'bg-zinc-100 text-zinc-900 font-medium shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={runWalkthrough}
              disabled={isRunning}
              className={`px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-2 transition-all ${isRunning ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-zinc-100 hover:bg-white text-zinc-900 cursor-pointer'}`}
            >
              {isRunning ? (<><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Playing…</>) : (<><Play className="w-3.5 h-3.5 fill-current" /> Play walkthrough</>)}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[400px]">
            {/* Left: mock page */}
            <div className="lg:col-span-6 p-6 border-b lg:border-b-0 lg:border-r border-zinc-800 bg-zinc-950">
              <div className="relative rounded border border-white/10 bg-[#121316] p-5 overflow-hidden h-full min-h-[300px]">
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-3 mb-4 text-[11px] font-mono text-zinc-400">
                  <span>example-store.test</span>
                  <span>{selectedScenario === 'layout' ? '390x844' : '1440x900'}</span>
                </div>

                {selectedScenario === 'checkout' ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded bg-zinc-900/90 border border-white/[0.06] flex justify-between items-center">
                      <span className="font-medium text-white">Team plan &times; 5 seats</span>
                      <span className="font-mono font-semibold text-zinc-200">$120.00</span>
                    </div>
                    <div className="p-3 rounded bg-zinc-900/60 border border-white/15 space-y-2">
                      <label className="text-[11px] text-zinc-400 block">Promo code</label>
                      <div className="flex gap-2">
                        <input readOnly value={stepIndex >= 2 ? 'SPRING25' : ''} placeholder="Enter code" className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1 text-xs font-mono text-zinc-200 focus:outline-none" />
                        <span className={`px-3 py-1 rounded text-xs font-medium ${stepIndex >= 3 ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>{stepIndex >= 3 ? 'Applied' : 'Apply'}</span>
                      </div>
                    </div>
                    <div className="border-t border-white/[0.07] pt-2.5 flex justify-between font-semibold">
                      <span className="text-zinc-400">Total</span>
                      <span className="text-white font-mono text-sm">{stepIndex >= 3 ? '$90.00' : '$120.00'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded bg-zinc-900/90 border border-white/[0.06] text-zinc-300">Order summary &mdash; 3 items</div>
                    <div className={`p-2.5 rounded border text-[11px] ${stepIndex >= 2 ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' : 'bg-zinc-900/40 border-white/[0.06] text-zinc-500'}`}>
                      <div className="font-semibold flex items-center gap-1">
                        <AlertTriangle className={`w-3.5 h-3.5 ${stepIndex >= 2 ? 'text-amber-400' : 'text-zinc-600'}`} />
                        {stepIndex >= 2 ? 'Primary button overlaps the fixed bottom bar' : 'Checking footer…'}
                      </div>
                    </div>
                  </div>
                )}

                {isRunning && (
                  <div
                    className="absolute pointer-events-none transition-all duration-700 ease-out z-30"
                    style={{ top: `${30 + (stepIndex % 4) * 14}%`, left: `${25 + (stepIndex % 3) * 22}%` }}
                  >
                    <MousePointer className="w-5 h-5 text-zinc-200 fill-zinc-200" />
                  </div>
                )}
              </div>
            </div>

            {/* Right: trace */}
            <div className="lg:col-span-6 p-6 bg-zinc-900/40">
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded border border-zinc-800 text-[11px] w-fit mb-4">
                {[['stream', 'Step trace'], ['api', 'Request shape']].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setTelemetryTab(key)}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${telemetryTab === key ? 'bg-white/[0.06] text-zinc-200 font-semibold border border-white/15' : 'text-zinc-400 hover:text-zinc-200'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {telemetryTab === 'stream' ? (
                <div className="space-y-2.5">
                  {steps.map((step, idx) => {
                    const reached = stepIndex > idx || (!isRunning && stepIndex === steps.length - 1);
                    const current = isRunning && stepIndex === idx;
                    return (
                      <div key={step.title} className={`p-2.5 rounded border text-xs transition-all ${current ? 'bg-white/[0.04] border-white/15' : reached ? 'bg-zinc-950/60 border-zinc-800/80' : 'bg-zinc-950/20 border-zinc-800/50 opacity-50'}`}>
                        <div className="flex items-center gap-2">
                          {reached || (current && step.done) ? (
                            step.warn ? <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : current ? (
                            <RefreshCw className="w-4 h-4 text-zinc-200 animate-spin shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-zinc-700 shrink-0" />
                          )}
                          <span className={`font-mono font-semibold ${current ? 'text-zinc-200' : reached ? 'text-zinc-200' : 'text-zinc-500'}`}>{step.title}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-400 pl-6 leading-relaxed">{step.detail}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 rounded bg-black/70 border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-x-auto">
                  <div className="text-zinc-200 font-semibold mb-1">{'// What agent/computer_use.py sends each turn'}</div>
                  <pre className="text-[10px] leading-relaxed">{`client.messages.create(
  model="${MODEL_ID}",
  tools=[{"type": "${TOOLSET_ID}"}],
  system=[{ ..., "cache_control": {"type": "ephemeral"} }],
  messages=[goal, assistant tool_use,
            user tool_result(screenshot), ...]
)`}</pre>
                </div>
              )}

              <div className="mt-5 pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-1.5">
                <GitPullRequest className="w-3.5 h-3.5 text-zinc-300" /> Illustration only &mdash; no tokens, latency or cache numbers are claimed here.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Status */}
      <section id="status" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-white/[0.07]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className={pill}>Honest status</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">What exists today, and what doesn&apos;t</h2>
          <p className="mt-3 text-zinc-400 text-sm">We have not published cost, latency or accuracy figures because we have not measured them yet.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-md border border-emerald-500/20 surface-glass">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 mb-4">In the repo today</div>
            <ul className="space-y-3 text-xs text-zinc-300">
              {works.map((item) => (
                <li key={item} className="flex gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" />{item}</li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-md border border-white/[0.08] surface-glass">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-4">Next</div>
            <ul className="space-y-3 text-xs text-zinc-400">
              {planned.map((item) => (
                <li key={item} className="flex gap-2"><Circle className="w-4 h-4 text-zinc-600 shrink-0" />{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Why Claude */}
      <section id="why-claude" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.07]">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className={pill}><Layers className="w-3.5 h-3.5" /> Why Claude</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Built on the parts of the API that make this possible</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            [Eye, 'Computer use toolset', `One {"type": "${TOOLSET_ID}"} entry gives Claude screenshot, click, type and scroll tools. The agent decides from pixels, so a renamed CSS class does not break a test.`],
            [Terminal, 'Plain-English goals', 'The test is a sentence, not a script. That makes it cheap to write exploratory and smoke checks that would never justify a hand-coded suite.'],
            [Code2, 'Prompt caching', 'Every turn repeats the same system prompt, so it is marked cache_control: ephemeral. The agent reports real cache_read_input_tokens from the API response after each run.']
          ].map(([Icon, title, text]) => (
            <div key={title} className="p-7 rounded-md border border-white/[0.08] surface-glass hover:border-white/15 transition-all">
              <div className="w-11 h-11 rounded bg-white/[0.06] border border-white/15 flex items-center justify-center text-zinc-200 mb-5">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-white/[0.07]">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl font-bold text-white tracking-tight">Where it fits next to Playwright and Cypress</h2>
          <p className="mt-2 text-zinc-400 text-sm">A complement for exploratory and visual checks, not a replacement for a deterministic regression suite.</p>
        </div>
        <div className="rounded-md border border-white/10 surface-glass overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-mono text-zinc-400 uppercase bg-black/40">
                <th className="py-4 px-6 font-semibold">&nbsp;</th>
                <th className="py-4 px-6 font-semibold text-zinc-200 bg-zinc-100/[0.07]">SynapseQA</th>
                <th className="py-4 px-6 font-semibold">Scripted (Playwright / Cypress)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-zinc-300">
              {[
                ['Authoring', 'A sentence of English', 'Code with selectors'],
                ['Survives UI refactors', 'Usually, since it works from what is visible', 'Breaks when selectors change'],
                ['Visual defects (overlap, clipping)', 'Can notice them', 'Only if you wrote an assertion'],
                ['Speed and cost per run', 'Slower; each step is a model call', 'Fast and effectively free'],
                ['Determinism', 'Not guaranteed; the model decides', 'Fully deterministic']
              ].map(([row, a, b]) => (
                <tr key={row}>
                  <td className="py-4 px-6 font-medium text-white">{row}</td>
                  <td className="py-4 px-6 text-zinc-200 bg-zinc-100/[0.04]">{a}</td>
                  <td className="py-4 px-6 text-zinc-400">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/[0.07]">
        <h2 className="text-3xl font-bold text-white text-center mb-12 tracking-tight">FAQ</h2>
        <div className="space-y-4">
          {[
            ['Is the walkthrough above a live run?', 'No. It is a scripted illustration. The real agent lives in agent/computer_use.py; clone the repo and run it with your own Anthropic key to see real traces.'],
            ['Is this ready for production CI?', 'Not yet. The loop, CLI and exit codes are unit-tested offline against a fake client that enforces the API’s tool_result format, but we have not yet validated a full run against a live model or benchmarked accuracy, cost or flakiness. Treat it as an early, open-source tool.'],
            ['What data leaves my machine?', 'Every step sends a screenshot of the page to the Anthropic API. Do not point it at pages showing sensitive data, run it in a throwaway VM or container, and follow Anthropic\u2019s computer use security guidance.']
          ].map(([q, a]) => (
            <div key={q} className="p-6 rounded-md border border-white/[0.08] surface-glass">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-zinc-200 shrink-0" /> {q}
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-black/60 py-12 px-4 sm:px-6 lg:px-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-zinc-100 flex items-center justify-center text-white">
              <Eye className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-zinc-300">SynapseQA</span>
            <span>MIT licensed &middot; &copy; 2026 Yakup Ak&ccedil;ay</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-zinc-400">
            <a href="#walkthrough" className="hover:text-white transition-colors">Walkthrough</a>
            <button onClick={() => setIsDocsOpen(true)} className="hover:text-white transition-colors cursor-pointer">Docs</button>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white transition-colors">{CONTACT_EMAIL}</a>
          </div>
        </div>
      </footer>

      {/* Docs modal */}
      {isDocsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 ">
          <div className="bg-zinc-900 border border-zinc-700 rounded-md max-w-3xl w-full p-6 sm:p-8 relative max-h-[88vh] overflow-y-auto">
            <button onClick={() => setIsDocsOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-xl font-bold cursor-pointer">&times;</button>
            <div className="flex items-center gap-2 text-zinc-200 text-xs font-semibold uppercase tracking-wider mb-2">
              <Code2 className="w-4 h-4" /> Documentation
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Using SynapseQA</h3>

            <div className="space-y-6 text-left">
              <div>
                <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-2">CLI flags</h4>
                <pre className="p-4 rounded bg-black/80 border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-x-auto leading-relaxed">{`--target=<url>        page to test (required)
--goal="<sentence>"   what the agent should try
--max-steps=12        cap on model turns
--model=${MODEL_ID}
--dry-run             no model call, no browser

exit code: 0 = PASS or --dry-run, 1 = FAIL or INCONCLUSIVE,
            2 = error (including a missing ANTHROPIC_API_KEY)`}</pre>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-2">Tests (no network needed)</h4>
                <pre className="p-4 rounded bg-black/80 border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-x-auto leading-relaxed">{`cd agent && python -m unittest -v`}</pre>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                The agent returns <code className="font-mono text-zinc-200">status</code>, the step list, the model&apos;s written report and the token usage
                reported by the API (including <code className="font-mono text-zinc-200">cache_read_input_tokens</code>).
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center">
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-xs text-zinc-200 hover:underline font-medium">View source on GitHub &rarr;</a>
              <button onClick={() => setIsDocsOpen(false)} className="px-5 py-2 rounded bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-semibold cursor-pointer">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Early access modal: opens the visitor's email client; nothing is stored by the site */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 ">
          <div className="bg-zinc-900 border border-zinc-700 rounded-md max-w-md w-full p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg font-bold cursor-pointer">&times;</button>
            <div className="w-10 h-10 rounded bg-white/[0.06] border border-white/15 flex items-center justify-center text-zinc-200 mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Request early access</h3>
            <p className="text-xs text-zinc-400 mb-5">
              There is no hosted product yet. Tell us what you would like to test and we will reach out. This opens your email client addressed to {CONTACT_EMAIL}.
            </p>
            <form onSubmit={submitEarlyAccess} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Your email</label>
                <input type="email" required placeholder="you@yourcompany.com" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Site or repo to test (optional)</label>
                <input type="text" placeholder="https://github.com/your-org/webapp" value={projectInput} onChange={(e) => setProjectInput(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-400" />
              </div>
              <button type="submit" className="w-full py-2.5 rounded bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-sm transition-all cursor-pointer">
                Compose email
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
