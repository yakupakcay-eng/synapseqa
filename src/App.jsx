import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Terminal,
  Cpu,
  Eye,
  Shield,
  GitPullRequest,
  Sparkles,
  Layers,
  Code2,
  Check,
  RefreshCw,
  Sliders,
  DollarSign,
  MousePointer,
  HelpCircle,
  Copy
} from 'lucide-react';

const scenarios = {
  checkout: {
    title: 'E-Commerce Checkout & Discount Flow',
    description: 'Navigate to cart, apply coupon code "SPRING25", ensure shipping recalculates, and verify edge case with expired card.',
    steps: [
      { title: 'Booting Sandboxed Chromium', detail: 'Allocated clean browser instance (Viewport 1440x900). Claude Computer Use initialized.', status: 'done', latency: '0.4s' },
      { title: 'Visual Coordinate Mapping', detail: 'Claude Vision inspected screen: mapped "Add to Cart" button at (x: 842, y: 310).', status: 'done', latency: '0.9s' },
      { title: 'Autonomous Action: Mouse Move & Click', detail: 'Moved cursor to cart button, dispatched click event, cart drawer expanded.', status: 'done', latency: '0.3s' },
      { title: 'Input Text & Coupon Validation', detail: 'Entered "SPRING25" into coupon field. Claude detected layout shift: Total updated from $120.00 to $90.00 (-25%).', status: 'done', latency: '1.1s' },
      { title: 'Negative Testing: Expired Card', detail: 'Tested credit card year 2023. Verified proper inline warning: "Card expired" displayed with proper aria-live attribute.', status: 'done', latency: '0.8s' },
      { title: 'Test Verdict: PASSED', detail: 'All 5 assertions met. Full video replay and trace telemetry logged to CI dashboard.', status: 'success', latency: '3.5s total' }
    ]
  },
  auth: {
    title: 'SaaS Workspace Onboarding & RBAC',
    description: 'Verify new user invite, team permissions, role-based access control, and dark mode preference persistence.',
    steps: [
      { title: 'Session Isolation & Multi-Context', detail: 'Spawned dual browser sessions: Admin (Owner) and Invitee (Read-Only).', status: 'done', latency: '0.6s' },
      { title: 'Admin Invitation Dispatch', detail: 'Admin typed invite email "colleague@acme.inc", role assigned: "Editor".', status: 'done', latency: '0.7s' },
      { title: 'Magic Link Token Extraction', detail: 'Claude fetched webhook token, opened magic link in second browser.', status: 'done', latency: '1.0s' },
      { title: 'Visual Regression & RBAC Check', detail: 'Verified that "Billing" tab is hidden for Editor role. Claude Vision confirmed zero forbidden UI buttons leaked.', status: 'done', latency: '0.9s' },
      { title: 'Test Verdict: PASSED', detail: 'RBAC boundary preserved. Zero security leaks detected.', status: 'success', latency: '3.2s total' }
    ]
  },
  bugfix: {
    title: 'Autonomous Bug Discovery & Auto-PR',
    description: 'Find broken checkout modal on mobile viewport (390x844), detect overflowing button, and generate code fix.',
    steps: [
      { title: 'Mobile Viewport Emulation', detail: 'Resized viewport to iPhone 15 Pro (390x844, DPR 3).', status: 'done', latency: '0.3s' },
      { title: 'Visual Anomaly Flagged', detail: 'Claude Vision detected: "Proceed to Payment" button overlaps with fixed bottom navigation bar.', status: 'warning', latency: '0.8s' },
      { title: 'DOM & CSS Root-Cause Analysis', detail: 'Identified culprit: `.checkout-footer` lacks `pb-safe` (safe-area-inset-bottom padding).', status: 'done', latency: '1.2s' },
      { title: 'Autonomous PR Generated', detail: 'Created Git Branch `fix/checkout-mobile-overflow` with 2-line Tailwind fix. Opened PR #142 with before/after screenshots.', status: 'success', latency: '2.8s total' }
    ]
  }
};

export default function App() {
  const [selectedScenario, setSelectedScenario] = useState('checkout');
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [targetUrl, setTargetUrl] = useState('https://stage.acmestore.io/app');
  const [telemetryTab, setTelemetryTab] = useState('stream');
  const [customPrompt, setCustomPrompt] = useState('Test user login with Google OAuth, navigate to settings, toggle 2FA, and assert confirmation modal appears.');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // ROI Calculator states
  const [devCount, setDevCount] = useState(8);
  const [releasesPerWeek, setReleasesPerWeek] = useState(4);
  const [hourlyRate, setHourlyRate] = useState(65);

  const calculateSavings = () => {
    const hoursSpentOnQAWeekly = devCount * 6; // ~6 hrs per dev per week
    const monthlyCost = hoursSpentOnQAWeekly * 4.2 * hourlyRate;
    const hoursSavedMonthly = Math.round(hoursSpentOnQAWeekly * 4.2 * 0.85);
    const dollarsSavedMonthly = Math.round(monthlyCost * 0.85);
    return { hoursSavedMonthly, dollarsSavedMonthly };
  };

  const { hoursSavedMonthly, dollarsSavedMonthly } = calculateSavings();

  const runSimulation = () => {
    setIsRunningTest(true);
    setCurrentStepIndex(0);
  };

  useEffect(() => {
    if (isRunningTest) {
      const activeSteps = scenarios[selectedScenario].steps;
      if (currentStepIndex < activeSteps.length - 1) {
        const timer = setTimeout(() => {
          setCurrentStepIndex(prev => prev + 1);
        }, 1200);
        return () => clearTimeout(timer);
      } else {
        const endTimer = setTimeout(() => {
          setIsRunningTest(false);
        }, 1500);
        return () => clearTimeout(endTimer);
      }
    }
  }, [isRunningTest, currentStepIndex, selectedScenario]);

  const copyInstallCode = () => {
    navigator.clipboard.writeText('npm install -g @synapseqa/cli\nsynapseqa init --key=claude_sk_...');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0c0d0e] text-zinc-100 selection:bg-orange-500/30 selection:text-orange-200">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-orange-500/15 via-amber-600/5 to-transparent blur-[120px] rounded-full glow-ambient" />
        <div className="absolute top-[800px] -left-40 w-[600px] h-[500px] bg-orange-600/5 blur-[140px] rounded-full" />
      </div>

      {/* Top Banner: Claude for Startups Acknowledgement */}
      <div className="relative z-50 border-b border-orange-500/20 bg-orange-950/20 backdrop-blur-md px-4 py-2 text-center text-xs font-medium text-orange-200/90 flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-[11px] text-orange-300 font-semibold tracking-wide uppercase">
          <Sparkles className="w-3 h-3 text-orange-400" /> Anthropic Claude Ecosystem
        </span>
        <span>Architected natively for <strong>Claude 3.7 Sonnet Computer Use API</strong>, Extended Thinking &amp; Ephemeral Prompt Caching.</span>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="ml-2 underline hover:text-white transition-colors cursor-pointer"
        >
          Request Early Pilot &rarr;
        </button>
      </div>

      {/* Header / Navbar */}
      <header className="relative z-40 border-b border-zinc-800/80 bg-[#0c0d0e]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 border border-orange-400/30">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Synapse<span className="text-orange-500">QA</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-mono">v1.3</span>
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400">
            <a href="#live-simulator" className="hover:text-zinc-100 transition-colors">Live Sandbox</a>
            <a href="#architecture" className="hover:text-zinc-100 transition-colors">Claude Engine</a>
            <a href="#roi-calculator" className="hover:text-zinc-100 transition-colors">ROI Calculator</a>
            <a href="#pricing" className="hover:text-zinc-100 transition-colors">Pricing</a>
            <button
              onClick={() => setIsDocsOpen(true)}
              className="hover:text-orange-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-orange-400" /> Docs &amp; SDK
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDocsOpen(true)}
              className="text-xs sm:text-sm font-medium text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-700/60 hover:bg-zinc-800/50 transition-all cursor-pointer"
            >
              API Docs
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-4 py-2 rounded-lg shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-300 text-xs sm:text-sm font-medium mb-8">
          <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-ping" />
          <span>Next-Gen Autonomous QA: Zero Brittle Selectors, 100% Vision & Computer Use</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          Stop writing brittle test scripts. <br />
          <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
            Let Claude test your web apps like a human.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
          SynapseQA leverages <strong>Anthropic Claude 3.7 Sonnet Computer Use</strong> to autonomously navigate, test, and audit your web applications. It sees the UI, moves the mouse, fills forms, catches visual layout bugs, and automatically opens GitHub PRs with fixes.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            Deploy First QA Agent in 60s <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#live-simulator"
            className="px-6 py-3.5 rounded-xl border border-zinc-700 hover:border-zinc-500 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-200 font-medium text-base flex items-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 text-orange-400" /> Watch Interactive Simulation
          </a>
        </div>

        {/* Key Metrics */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">0 min</div>
            <div className="text-xs text-zinc-400 mt-1">Cypress / Selenium code to maintain</div>
          </div>
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-bold text-orange-400 tracking-tight">99.4%</div>
            <div className="text-xs text-zinc-400 mt-1">Reduction in false positive flakiness</div>
          </div>
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">3.2 sec</div>
            <div className="text-xs text-zinc-400 mt-1">Average user journey verification</div>
          </div>
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-bold text-amber-400 tracking-tight">Auto-PR</div>
            <div className="text-xs text-zinc-400 mt-1">Direct GitHub fix generation</div>
          </div>
        </div>

        {/* Terminal Quickstart */}
        <div className="mt-12 max-w-xl mx-auto p-3 rounded-xl border border-zinc-800 bg-black/60 font-mono text-xs text-left flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2 text-zinc-400 overflow-x-auto py-1">
            <span className="text-orange-500 font-bold">$</span>
            <span className="text-zinc-200">npx synapseqa-agent --target="https://myapp.dev" --autonomous</span>
          </div>
          <button
            onClick={copyInstallCode}
            className="ml-3 p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1 shrink-0"
            title="Copy command"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </section>

      {/* Interactive Live Agent Simulator */}
      <section id="live-simulator" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-850">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-400 text-xs font-semibold mb-3">
            <Cpu className="w-3.5 h-3.5" /> LIVE SIMULATOR
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Watch Claude Computer Use Audit In Real-Time
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            Select a test case below, or trigger the autonomous agent to observe how Claude translates user intent into mouse clicks, keyboard input, and automated bug reports.
          </p>
        </div>

        {/* Simulator Container */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Top Bar / Mac-like Browser Header */}
          <div className="border-b border-zinc-800 bg-zinc-900/70 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-zinc-400 font-mono ml-2">SynapseQA Virtual Headless Worker #04 (Linux 64-bit)</span>
            </div>

            {/* Scenario Picker */}
            <div className="flex items-center gap-1 bg-zinc-850 p-1 rounded-lg border border-zinc-750 text-xs">
              <button
                onClick={() => { setSelectedScenario('checkout'); setCurrentStepIndex(-1); setIsRunningTest(false); }}
                className={`px-3 py-1 rounded-md transition-all ${selectedScenario === 'checkout' ? 'bg-orange-500 text-white font-medium shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                1. Checkout & Discount
              </button>
              <button
                onClick={() => { setSelectedScenario('auth'); setCurrentStepIndex(-1); setIsRunningTest(false); }}
                className={`px-3 py-1 rounded-md transition-all ${selectedScenario === 'auth' ? 'bg-orange-500 text-white font-medium shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                2. Multi-Role RBAC
              </button>
              <button
                onClick={() => { setSelectedScenario('bugfix'); setCurrentStepIndex(-1); setIsRunningTest(false); }}
                className={`px-3 py-1 rounded-md transition-all ${selectedScenario === 'bugfix' ? 'bg-orange-500 text-white font-medium shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                3. Bug Discovery & Fix PR
              </button>
            </div>

            <button
              onClick={runSimulation}
              disabled={isRunningTest}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                isRunningTest
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20'
              }`}
            >
              {isRunningTest ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Claude Executing...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> Run Test Agent
                </>
              )}
            </button>
          </div>

          {/* Simulator Content: Two columns (Agent Screen & Execution Telemetry) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
            {/* Left: Virtual Screen Viewport */}
            <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400 mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                    <span className="text-zinc-500 shrink-0">Target URL:</span>
                    <input
                      type="text"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 font-mono text-xs text-zinc-200 w-full max-w-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <span className="font-mono text-[11px] text-orange-400/90 bg-orange-950/30 border border-orange-500/20 px-2 py-0.5 rounded">
                    claude-3-7-sonnet-20250219 (computer_20250124)
                  </span>
                </div>

                {/* Simulated Web Application Display */}
                <div className="relative rounded-xl border border-zinc-800 bg-[#16181b] p-5 shadow-inner overflow-hidden">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-zinc-700 flex items-center justify-center text-[10px] font-bold">AC</div>
                      <span className="text-xs font-semibold text-zinc-200">Acme Cloud Store</span>
                    </div>
                    <div className="flex gap-2 text-[11px] text-zinc-400">
                      <span>Products</span>
                      <span>Pricing</span>
                      <span className="text-orange-400 font-medium">Cart (2)</span>
                    </div>
                  </div>

                  {/* Simulated App Page based on scenario */}
                  {selectedScenario === 'checkout' && (
                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                        <div>
                          <div className="font-medium text-white">Pro Enterprise Plan (Monthly)</div>
                          <div className="text-[11px] text-zinc-500">Seats: 5 users</div>
                        </div>
                        <div className="text-right font-mono font-semibold text-zinc-200">$120.00</div>
                      </div>

                      <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-2">
                        <label className="text-[11px] text-zinc-400 block">Promo Code</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={currentStepIndex >= 3 ? "SPRING25" : ""}
                            placeholder="Enter promo code"
                            className="w-full bg-zinc-950 border border-zinc-750 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none"
                          />
                          <button className={`px-3 py-1 rounded text-xs font-medium ${currentStepIndex >= 3 ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                            {currentStepIndex >= 3 ? 'Applied' : 'Apply'}
                          </button>
                        </div>
                        {currentStepIndex >= 3 && (
                          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Coupon "SPRING25" applied: -$30.00
                          </div>
                        )}
                      </div>

                      <div className="border-t border-zinc-800 pt-2 flex justify-between text-xs font-semibold">
                        <span className="text-zinc-400">Total Calculated:</span>
                        <span className="text-white font-mono text-sm">
                          {currentStepIndex >= 3 ? '$90.00' : '$120.00'}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedScenario === 'auth' && (
                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                        <div className="text-zinc-300 font-medium mb-1">Active Team Members (2/10)</div>
                        <div className="text-[11px] text-zinc-500">Testing Role Boundaries and Invite tokens</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                          <span className="text-zinc-400 block">Current User:</span>
                          <span className="font-semibold text-orange-400">admin@acme.inc</span>
                          <span className="text-[10px] text-emerald-400 block mt-1">Role: SuperAdmin</span>
                        </div>
                        <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                          <span className="text-zinc-400 block">Invited Agent:</span>
                          <span className="font-semibold text-zinc-300">qa-worker@agent.io</span>
                          <span className="text-[10px] text-blue-400 block mt-1">Role: Editor (Verified)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedScenario === 'bugfix' && (
                    <div className="space-y-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-600/40 text-amber-200">
                        <div className="font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Layout Regression Detected (Mobile DPR)
                        </div>
                        <div className="text-[11px] text-amber-300/80 mt-1">
                          Bottom CTA button hidden beneath iPhone navigation bar.
                        </div>
                      </div>
                      {currentStepIndex >= 3 && (
                        <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-600/40 text-emerald-200 text-[11px] font-mono">
                          <div className="text-emerald-400 font-semibold mb-1">Git Diff generated by Claude:</div>
                          <div className="text-red-400">- className="checkout-footer"</div>
                          <div className="text-emerald-400">+ className="checkout-footer pb-safe"</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Virtual cursor representing Claude Computer Use */}
                  {isRunningTest && (
                    <div
                      className="absolute pointer-events-none transition-all duration-700 ease-out z-30"
                      style={{
                        top: currentStepIndex === 0 ? '40%' : currentStepIndex === 1 ? '55%' : currentStepIndex === 2 ? '70%' : '60%',
                        left: currentStepIndex === 0 ? '30%' : currentStepIndex === 1 ? '60%' : currentStepIndex === 2 ? '80%' : '50%'
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <MousePointer className="w-5 h-5 text-orange-400 fill-orange-500 drop-shadow-md" />
                        <span className="px-1.5 py-0.5 rounded bg-orange-500 text-[9px] text-white font-mono font-bold shadow">
                          Claude Action
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Natural Language Prompt Input */}
              <div className="mt-4 pt-4 border-t border-zinc-850">
                <label className="text-xs font-medium text-zinc-400 block mb-1.5 flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-orange-400" /> Custom Test Prompt (Plain English):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={runSimulation}
                    className="px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    Send to Claude
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Real-time Telemetry & Claude Thought Stream */}
            <div className="lg:col-span-5 p-6 bg-zinc-900/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
                  <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-[11px]">
                    <button
                      onClick={() => setTelemetryTab('stream')}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${telemetryTab === 'stream' ? 'bg-orange-500/20 text-orange-300 font-semibold border border-orange-500/30' : 'text-zinc-400 hover:text-zinc-200'}`}
                    >
                      Execution Stream
                    </button>
                    <button
                      onClick={() => setTelemetryTab('api')}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${telemetryTab === 'api' ? 'bg-orange-500/20 text-orange-300 font-semibold border border-orange-500/30' : 'text-zinc-400 hover:text-zinc-200'}`}
                    >
                      Anthropic API &amp; Cache Trace
                    </button>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">Cache Hit: 94.2%</span>
                </div>

                {telemetryTab === 'stream' ? (
                  <div className="space-y-3">
                    {scenarios[selectedScenario].steps.map((step, idx) => {
                      const isPassed = currentStepIndex > idx || (!isRunningTest && currentStepIndex === -1);
                      const isCurrent = isRunningTest && currentStepIndex === idx;

                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-lg border transition-all text-xs ${
                            isCurrent
                              ? 'bg-orange-950/20 border-orange-500/50 shadow-sm'
                              : isPassed
                              ? 'bg-zinc-950/60 border-zinc-800/80'
                              : 'bg-zinc-950/20 border-zinc-850 opacity-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {isPassed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : isCurrent ? (
                                <RefreshCw className="w-4 h-4 text-orange-400 animate-spin shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
                              )}
                              <span className={`font-semibold ${isCurrent ? 'text-orange-300' : isPassed ? 'text-zinc-200' : 'text-zinc-500'}`}>
                                {step.title}
                              </span>
                            </div>
                            <span className="font-mono text-[10px] text-zinc-500">{step.latency}</span>
                          </div>
                          <p className="mt-1 text-[11px] text-zinc-400 pl-6 leading-relaxed">
                            {step.detail}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3 font-mono text-[11px]">
                    <div className="p-3 rounded-lg bg-black/70 border border-zinc-800 text-zinc-300 overflow-x-auto">
                      <div className="text-orange-400 font-semibold mb-1">// Anthropic Beta Messages Request</div>
                      <pre className="text-[10px] leading-relaxed text-zinc-300">{`POST https://api.anthropic.com/v1/messages
anthropic-beta: computer-use-2025-01-24, prompt-caching-2024-07-31

{
  "model": "claude-3-7-sonnet-20250219",
  "thinking": { "type": "enabled", "budget_tokens": 4096 },
  "tools": [{
    "type": "computer_20250124",
    "name": "computer",
    "display_width_px": 1440,
    "display_height_px": 900,
    "cache_control": { "type": "ephemeral" }
  }]
}`}</pre>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-200">
                      <div className="font-semibold text-emerald-400 mb-1">// Ephemeral Prompt Cache Telemetry</div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>cache_read_input_tokens: <strong className="text-white">48,200</strong></div>
                        <div>uncached_input_tokens: <strong className="text-white">1,420</strong></div>
                        <div>thinking_tokens_used: <strong className="text-white">640</strong></div>
                        <div>latency_reduction: <strong className="text-emerald-400">-79.4%</strong></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom CI Integration Status */}
              <div className="mt-6 pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <GitPullRequest className="w-3.5 h-3.5 text-zinc-300" /> GitHub Actions &amp; Vercel Webhook Ready
                </span>
                <span className="text-emerald-400 font-mono font-medium">Synced</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Architecture: Why Claude Engine Wins */}
      <section id="architecture" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-850">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-400 text-xs font-semibold mb-3">
            <Layers className="w-3.5 h-3.5" /> ARCHITECTURAL ADVANTAGE
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Built From Ground Up On Claude's Unique Capabilities
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            Generic LLMs hallucinate code selectors. SynapseQA utilizes Anthropic Claude's specialized API primitives for resilient autonomous engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm hover:border-orange-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-5">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Native Computer Use API</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Unlike legacy Selenium or Playwright, Claude literally sees screen pixels, calculates precise click coordinates, and detects visual layout shifts that DOM scrapers miss entirely.
            </p>
            <div className="text-xs text-orange-400/90 font-mono bg-orange-950/30 p-2.5 rounded-lg border border-orange-800/30">
              `tool_use: computer (action: mouse_move, coordinate: [842, 310])`
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm hover:border-orange-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">200k Token Context Window</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              When a bug is detected, SynapseQA feeds your entire Git repository AST and design tokens into Claude's context to generate accurate, zero-hallucination PR bugfixes.
            </p>
            <div className="text-xs text-amber-400/90 font-mono bg-amber-950/30 p-2.5 rounded-lg border border-amber-800/30">
              Repo Context: 140 files ingested &bull; AST Diff Verified
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm hover:border-orange-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Constitutional AI & Zero Flakiness</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Equipped with self-correcting validation loops. If a button is loading, Claude automatically waits for network idle instead of failing the test pipeline with timeout errors.
            </p>
            <div className="text-xs text-emerald-400/90 font-mono bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-800/30">
              Confidence Score: 99.8% &bull; Flaky retries: 0
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section id="roi-calculator" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-850">
        <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/50 to-zinc-950 p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Sliders */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-400 text-xs font-semibold mb-3">
                  <Sliders className="w-3.5 h-3.5" /> IMPACT CALCULATOR
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Calculate Your Team's QA Efficiency & Cost Savings
                </h2>
                <p className="mt-2 text-zinc-400 text-sm">
                  Engineering teams waste 15-25% of their total sprint capacity writing and maintaining brittle regression tests. See how much you reclaim with SynapseQA.
                </p>
              </div>

              {/* Slider 1 */}
              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-zinc-300">Software Engineers on Team</span>
                  <span className="text-orange-400 font-bold text-base">{devCount} devs</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={devCount}
                  onChange={(e) => setDevCount(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
                />
              </div>

              {/* Slider 2 */}
              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-zinc-300">Releases / Deploys Per Week</span>
                  <span className="text-orange-400 font-bold text-base">{releasesPerWeek} deploys</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={releasesPerWeek}
                  onChange={(e) => setReleasesPerWeek(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
                />
              </div>

              {/* Slider 3 */}
              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-zinc-300">Average Blended Hourly Rate</span>
                  <span className="text-orange-400 font-bold text-base">${hourlyRate} / hr</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="150"
                  step="5"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
                />
              </div>
            </div>

            {/* Right Result Card */}
            <div className="lg:col-span-5 p-8 rounded-2xl border border-orange-500/30 bg-orange-950/20 backdrop-blur-md text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-orange-400 mb-1">
                Estimated Monthly Savings
              </div>
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tight my-4">
                ${dollarsSavedMonthly.toLocaleString()}
                <span className="text-xs text-zinc-400 font-normal"> / mo</span>
              </div>
              <div className="text-sm text-zinc-300 mb-6 font-medium">
                Reclaiming <strong className="text-orange-400">{hoursSavedMonthly} engineering hours</strong> every month.
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-zinc-800 text-left space-y-2 text-xs text-zinc-400">
                <div className="flex items-center gap-2 text-zinc-200">
                  <Check className="w-4 h-4 text-emerald-400" /> 100% CI/CD automated pipeline
                </div>
                <div className="flex items-center gap-2 text-zinc-200">
                  <Check className="w-4 h-4 text-emerald-400" /> Zero Cypress/Playwright maintenance
                </div>
                <div className="flex items-center gap-2 text-zinc-200">
                  <Check className="w-4 h-4 text-emerald-400" /> Automatic bug PR pull-requests
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
              >
                Claim Free Pilot Access &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-850">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            How SynapseQA Compares To Legacy Solutions
          </h2>
          <p className="mt-2 text-zinc-400 text-sm">
            Why modern engineering teams are ditching fragile DOM-based tests for autonomous multimodal agents.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-400 uppercase">
                <th className="py-4 px-4 font-semibold">Capabilities</th>
                <th className="py-4 px-4 font-semibold text-orange-400 bg-orange-500/5 rounded-t-lg">SynapseQA (Claude)</th>
                <th className="py-4 px-4 font-semibold">Cypress / Playwright</th>
                <th className="py-4 px-4 font-semibold">Manual QA Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              <tr>
                <td className="py-4 px-4 font-medium text-white">Test Creation Method</td>
                <td className="py-4 px-4 text-orange-300 font-semibold bg-orange-500/5">Plain English Prompt</td>
                <td className="py-4 px-4 text-zinc-400">Complex Code / Selectors</td>
                <td className="py-4 px-4 text-zinc-400">Manual Spreadsheets</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-medium text-white">UI Refactor Resilience</td>
                <td className="py-4 px-4 text-emerald-400 font-semibold bg-orange-500/5">100% (Visual Perception)</td>
                <td className="py-4 px-4 text-red-400">Breaks on class/DOM rename</td>
                <td className="py-4 px-4 text-zinc-400">High but Slow</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-medium text-white">Execution Speed</td>
                <td className="py-4 px-4 text-orange-300 font-semibold bg-orange-500/5">&lt; 15 seconds per flow</td>
                <td className="py-4 px-4 text-zinc-400">Fast (if not broken)</td>
                <td className="py-4 px-4 text-red-400">Hours to Days</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-medium text-white">Auto-Generate Bugfix PR</td>
                <td className="py-4 px-4 text-emerald-400 font-semibold bg-orange-500/5">Yes (Full Git Diff)</td>
                <td className="py-4 px-4 text-red-400">No</td>
                <td className="py-4 px-4 text-red-400">No (File Jira ticket)</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-medium text-white">Cost per 1,000 runs</td>
                <td className="py-4 px-4 text-orange-300 font-semibold bg-orange-500/5">~$3.20 API Tokens</td>
                <td className="py-4 px-4 text-zinc-400">High Cloud Grid bill</td>
                <td className="py-4 px-4 text-red-400">$3,000+</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-850">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-400 text-xs font-semibold mb-3">
            <DollarSign className="w-3.5 h-3.5" /> TRANSPARENT PLANS
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Predictable Pricing for Rapidly Shipping Teams
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            Start with our generous free tier, upgrade as your test suite scales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plan 1 */}
          <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="text-base font-semibold text-white">Hacker & Indie</div>
              <div className="text-xs text-zinc-400 mt-1">For side projects & early-stage MVPs</div>
              <div className="text-3xl font-extrabold text-white my-6">$0 <span className="text-xs text-zinc-400 font-normal">/ forever</span></div>
              <ul className="space-y-3 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 100 Autonomous Agent Runs/mo</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Claude 3.5 Sonnet Engine</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> CLI & Local Headless runner</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Community Discord support</li>
              </ul>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-8 w-full py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 text-white font-medium text-xs transition-colors cursor-pointer"
            >
              Get Started Free
            </button>
          </div>

          {/* Plan 2: Featured */}
          <div className="p-8 rounded-2xl border-2 border-orange-500 bg-orange-950/20 backdrop-blur-md relative flex flex-col justify-between shadow-2xl shadow-orange-500/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-orange-500 text-white font-bold text-[10px] uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <div className="text-base font-semibold text-white">Startup Pro</div>
              <div className="text-xs text-zinc-400 mt-1">For fast-moving SaaS & engineering squads</div>
              <div className="text-3xl font-extrabold text-white my-6">$99 <span className="text-xs text-zinc-400 font-normal">/ month</span></div>
              <ul className="space-y-3 text-xs text-zinc-200">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 2,500 Agent Runs/mo</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Claude 3.7 Sonnet Computer Use</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Automated GitHub Fix PR generation</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Cross-browser & Mobile DPR emulation</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Priority API Queue & Slack support</li>
              </ul>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-8 w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-lg shadow-orange-500/30 transition-all cursor-pointer"
            >
              Start 14-Day Free Pilot
            </button>
          </div>

          {/* Plan 3 */}
          <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="text-base font-semibold text-white">Enterprise Scale</div>
              <div className="text-xs text-zinc-400 mt-1">For regulated teams requiring private VPC</div>
              <div className="text-3xl font-extrabold text-white my-6">Custom <span className="text-xs text-zinc-400 font-normal">/ billed annually</span></div>
              <ul className="space-y-3 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited Autonomous Runs</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Self-hosted On-Premises Runner</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> SOC2 Type II, HIPAA & GDPR Compliant</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Dedicated Anthropic Applied AI Engineer</li>
              </ul>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-8 w-full py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 text-white font-medium text-xs transition-colors cursor-pointer"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-zinc-850">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-orange-400" /> How is this different from Playwright or Cypress?
            </h4>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              Playwright and Cypress require engineers to code fragile CSS selectors, test fixtures, and mock states. When your team alters a button class or layout, tests fail immediately. SynapseQA uses Claude Computer Use to perceive visual elements exactly as human eyes do—zero selector code required.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-orange-400" /> How does it handle sensitive customer data & passwords?
            </h4>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              All browser workers run inside ephemeral, hardware-isolated Firecracker micro-VMs that terminate immediately post-run. Sensitive tokens and OAuth credentials can be injected via encrypted environment variables with zero plaintext logging to Anthropic.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-orange-400" /> Can it integrate into GitHub Actions or GitLab CI?
            </h4>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              Yes! Our lightweight CLI (`npx @synapseqa/cli run`) drops into any standard GitHub Actions YAML workflow. Tests trigger automatically on every Pull Request or preview deployment.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-black/60 py-12 px-4 sm:px-6 lg:px-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center text-white">
              <Eye className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-zinc-300">SynapseQA Inc.</span>
            <span>&copy; 2026 All rights reserved.</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All Agent Clusters Operational (99.98%)
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-zinc-400">
            <a href="#live-simulator" className="hover:text-white transition-colors">Product</a>
            <a href="#architecture" className="hover:text-white transition-colors">Claude Engine</a>
            <button onClick={() => setIsDocsOpen(true)} className="hover:text-white transition-colors cursor-pointer">Docs &amp; SDK</button>
            <a href="https://github.com/yakupakcay-eng/synapseqa" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <button onClick={() => setIsModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">Request Access</button>
          </div>
        </div>
      </footer>

      {/* Developer Docs & SDK Reference Modal */}
      {isDocsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-750 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[88vh] overflow-y-auto">
            <button
              onClick={() => setIsDocsOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white text-xl font-bold cursor-pointer"
            >
              &times;
            </button>

            <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Code2 className="w-4 h-4" /> Developer Documentation &amp; Anthropic SDK Integration
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">SynapseQA v1.3 Quickstart &amp; Architecture</h3>
            <p className="text-xs text-zinc-400 mb-6">
              Integrate autonomous Claude 3.7 Sonnet Computer Use verification directly into your CI/CD pipeline with Ephemeral Prompt Caching enabled by default.
            </p>

            <div className="space-y-6 text-left">
              <div>
                <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-2">1. GitHub Actions CI/CD Workflow (`.github/workflows/synapseqa.yml`)</h4>
                <pre className="p-4 rounded-xl bg-black/80 border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-x-auto leading-relaxed">{`name: Autonomous Visual QA
on: [pull_request]

jobs:
  synapseqa-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run SynapseQA Claude Computer Use Agent
        run: npx synapseqa --target="\${{ env.PREVIEW_URL }}" --autonomous --auto-pr
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`}</pre>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-2">2. Python Agent SDK with Ephemeral Prompt Caching &amp; Extended Thinking</h4>
                <pre className="p-4 rounded-xl bg-black/80 border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-x-auto leading-relaxed">{`from agent.computer_use import SynapseAgent

agent = SynapseAgent(
    model="claude-3-7-sonnet-20250219",
    viewport_width=1440,
    viewport_height=900
)

# Executes headless Playwright + Claude Computer Use (computer_20250124)
# Caches repository AST via cache_control={"type": "ephemeral"} (-90% token cost)
result = await agent.run_autonomous_audit(
    target_url="https://stage.myapp.dev/checkout",
    prompt="Verify discount code SPRING25 recalculates tax and total accurately."
)`}</pre>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="text-xs font-semibold text-white">Firecracker Micro-VMs</div>
                  <div className="text-[11px] text-zinc-400 mt-1">Ephemeral isolated browser sandboxes destroyed immediately post-run.</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="text-xs font-semibold text-orange-400">94.2% Cache Hit Ratio</div>
                  <div className="text-[11px] text-zinc-400 mt-1">Anthropic Prompt Caching keeps multi-step DOM/AST inspection fast and affordable.</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="text-xs font-semibold text-emerald-400">Zero-Selector Guarantee</div>
                  <div className="text-[11px] text-zinc-400 mt-1">Pure coordinate &amp; visual perception via Claude 3.7 Sonnet Computer Use.</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center">
              <a
                href="https://github.com/yakupakcay-eng/synapseqa"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-orange-400 hover:underline font-medium"
              >
                View Full Source on GitHub &rarr;
              </a>
              <button
                onClick={() => setIsDocsOpen(false)}
                className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Waitlist / Request Access Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-750 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => { setIsModalOpen(false); setSubmitted(false); }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg font-bold"
            >
              &times;
            </button>

            {!submitted ? (
              <div>
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Request Private Pilot Access</h3>
                <p className="text-xs text-zinc-400 mb-5">
                  Join 140+ forward-thinking teams testing web applications autonomously with Claude 3.7 Sonnet Computer Use.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (emailInput) setSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs font-medium text-zinc-300 block mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      placeholder="founder@yourcompany.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-300 block mb-1">Company Website / GitHub Repo</label>
                    <input
                      type="text"
                      placeholder="https://github.com/myteam/webapp"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
                  >
                    Get Early Access Key
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">You're on the priority pilot list!</h3>
                <p className="text-xs text-zinc-400 mb-6">
                  We sent an invitation link and API sandbox key to <span className="text-orange-400 font-mono">{emailInput}</span>.
                </p>
                <button
                  onClick={() => { setIsModalOpen(false); setSubmitted(false); }}
                  className="px-5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
