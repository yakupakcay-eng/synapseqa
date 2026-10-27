import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, lazy, Suspense } from 'react';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Eye,
  Code2,
  Check,
  RefreshCw,
  MousePointer2,
  Copy,
  Circle,
  Wrench,
  Tag,
  Ban,
  ShieldCheck,
  MessageSquareText,
  Gauge
} from 'lucide-react';

const LoopPlayer = lazy(() => import('./remotion/LoopPlayer'));

const REPO_URL = 'https://github.com/yakupakcay-eng/synapseqa';
const CONTACT_EMAIL = 'founder@synapseqa.me';
const MODEL_ID = 'claude-sonnet-5-5';
const TOOLSET_ID = 'computer_toolset_20260801';
const ENGINE_URL = `${REPO_URL}/blob/main/agent/computer_use.py`;
const TESTS_URL = `${REPO_URL}/blob/main/agent/test_agent.py`;
const CI_URL = `${REPO_URL}/actions/workflows/ci.yml`;

// Scripted walkthroughs: they illustrate what a run looks like. They are NOT live model output.
// `target` names the element on the mock page the cursor moves to; `capture` flashes a screenshot frame.
const scenarios = {
  checkout: {
    label: 'Checkout flow',
    viewport: '1440x900',
    steps: [
      { title: 'screenshot', detail: 'Agent looks at the loaded cart page before acting.', capture: true },
      { title: 'left_click → promo field', detail: 'Clicks the promo input it found visually, at pixel coordinates it chose.', target: 'field' },
      { title: 'type "SPRING25"', detail: 'Types the code into the focused field.', target: 'field' },
      { title: 'left_click → Apply', detail: 'Clicks the Apply button next to the field.', target: 'apply' },
      { title: 'screenshot → compare', detail: 'Reads the new total on screen and checks it against the expected 25% discount.', target: 'total', capture: true },
      { title: 'Report: VERDICT: PASS', detail: 'Plain-text report with the evidence it observed.', done: true }
    ]
  },
  layout: {
    label: 'Layout defect (mobile)',
    viewport: '390x844',
    steps: [
      { title: 'screenshot @ 390x844', detail: 'Mobile-sized viewport, same page.', capture: true },
      { title: 'scroll → bottom', detail: 'Scrolls down to the checkout button.', target: 'phone' },
      { title: 'screenshot → defect noticed', detail: 'The Place order button is partly hidden behind the fixed bottom bar.', target: 'overlap', capture: true, warn: true },
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
    code: `# run from the repo root after cloning
import asyncio
from agent.computer_use import SynapseAgent

result = asyncio.run(
    SynapseAgent().run_audit("https://example.com", "Smoke-test the sign-up flow")
)
print(result["status"], result["report"])`
  }
};

// Abridged from agent/computer_use.py (run_audit). Only lines were removed; none were rewritten.
const loopExcerpt = `for _ in range(max_steps):
    response = await self.client.messages.create(
        model=self.model,
        max_tokens=4096,
        system=self.system_blocks(),
        tools=[COMPUTER_TOOLSET],
        messages=messages,
    )
    usage.add(getattr(response, "usage", None))
    messages.append({"role": "assistant", "content": response.content})

    if getattr(response, "stop_reason", None) == "refusal":
        report = "The model declined this request (stop_reason: refusal). Nothing was concluded."
        break

    tool_uses = [b for b in response.content if getattr(b, "type", "") == "tool_use"]
    texts = [getattr(b, "text", "") for b in response.content if getattr(b, "type", "") == "text"]
    if not tool_uses:
        report = "\\n".join(t for t in texts if t).strip()
        break

    results = []
    for block in tool_uses:
        args = dict(getattr(block, "input", {}) or {})
        error = await self.execute_tool(page, block.name, args)
        ...
        # The computer toolset rejects results that omit toolset_name.
        results.append({"type": "tool_result", "tool_use_id": block.id,
                        "toolset_name": TOOLSET_NAME, "content": content,
                        **({"is_error": True} if error else {})})
    messages.append({"role": "user", "content": results})`;

const loopNotes = [
  [Wrench, 'One toolset entry', `{"type": "${TOOLSET_ID}"} gives Claude screenshot, click, type and scroll. zoom is switched off because the dispatcher does not implement it.`],
  [Tag, 'toolset_name on every result', 'The computer toolset rejects tool_result blocks without it. An offline test checks every result the loop sends back.'],
  [Ban, 'Refusals end the run', 'stop_reason "refusal" stops the loop and is reported as such, never read as a verdict.'],
  [ShieldCheck, 'No silent passes', 'A PASS with zero browser actions becomes INCONCLUSIVE, and a missing API key exits 2, so CI cannot go green by accident.']
];

const howSteps = [
  ['Browser', 'Headless Chromium opens your page in a fixed viewport via Playwright.'],
  ['Perceive', 'Claude gets the goal and the computer use toolset, and asks for a screenshot when it needs to see the page.'],
  ['Act', 'Claude answers with tool_use blocks. We run each action (click, type, scroll) and send back a tool_result.'],
  ['Report', 'When Claude stops calling tools it writes a report ending in VERDICT: PASS or FAIL. The CLI exits 0 or 1.']
];

const works = [
  'Multi-turn agent loop: screenshot → tool_use → tool_result, with full message history',
  'Browser action dispatcher on headless Chromium (click, drag, type, key, scroll, wait)',
  'CLI launcher with PASS / FAIL exit codes for CI',
  '12 offline unit tests with a scripted fake Claude client, run in CI on every push',
  'No silent passes: a missing API key exits 2, and a PASS with zero browser actions counts as inconclusive'
];
const planned = [
  'Benchmarks on real apps: accuracy, cost per run, latency (not measured yet)',
  'Repo-aware diagnosis: feed source files to Claude to localise the defect',
  'PR creation from a model-proposed patch is implemented but not yet run on a live repo',
  'Hosted runner and parallel runs',
  'Trace and replay viewer'
];

const NAV = [
  ['how-it-works', 'How it works'],
  ['walkthrough', 'Walkthrough'],
  ['code', 'Code'],
  ['who', 'Who it is for'],
  ['status', 'Status'],
  ['why-claude', 'Why Claude']
];

const container = 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8';
const primaryBtn = 'inline-flex items-center gap-2 bg-accent hover:bg-accent-strong active:scale-[0.98] text-white font-medium transition-[background-color,scale] duration-200 cursor-pointer';
const secondaryBtn = 'inline-flex items-center gap-2 bg-panel border border-line-strong hover:border-ink/30 active:scale-[0.98] text-ink font-medium transition-[border-color,scale] duration-200 cursor-pointer';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function useInView(ref, { threshold = 0.2, rootMargin = '0px 0px -8% 0px', once = true } = {}) {
  // Without IntersectionObserver, treat everything as visible.
  const [inView, setInView] = useState(() => !('IntersectionObserver' in window));
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (once) io.disconnect();
      } else if (!once) {
        setInView(false);
      }
    }, { threshold, rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold, rootMargin, once]);
  return inView;
}

// `frame` styles an inner layer that does the animating while the outer div is observed.
// The clip variant needs it: an element fully hidden by clip-path never counts as intersecting.
function Reveal({ variant = 'rise', delay = 0, className = '', frame, children }) {
  const ref = useRef(null);
  const shown = useInView(ref);
  if (frame) {
    return (
      <div ref={ref} className={className}>
        <div data-variant={variant} className={`reveal ${shown ? 'is-shown' : ''} ${frame}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
          {children}
        </div>
      </div>
    );
  }
  return (
    <div ref={ref} data-variant={variant} className={`reveal ${shown ? 'is-shown' : ''} ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}

// A lucide icon whose strokes draw themselves the first time it scrolls into view.
function DrawIcon({ icon: Icon, className = '', delay = 0, strokeWidth = 1.75 }) {
  const ref = useRef(null);
  const on = useInView(ref, { threshold: 0.6 });
  useEffect(() => {
    ref.current?.querySelectorAll('svg *').forEach((n) => n.setAttribute('pathLength', '1'));
  }, []);
  return (
    <span ref={ref} aria-hidden="true" className={`draw inline-flex ${on ? 'is-on' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      <Icon strokeWidth={strokeWidth} className="w-full h-full" />
    </span>
  );
}

// Segmented tabs with an indicator that slides to the selected option.
function SegTabs({ items, value, onChange, label, dark = false }) {
  const btns = useRef({});
  const [ind, setInd] = useState(null);

  useLayoutEffect(() => {
    const measure = () => {
      const b = btns.current[value];
      if (b) setInd({ left: b.offsetLeft, width: b.offsetWidth });
    };
    const raf = requestAnimationFrame(measure);
    document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [value]);

  return (
    <div role="tablist" aria-label={label} className={`relative inline-flex p-1 rounded-lg ${dark ? 'bg-white/[0.06] border border-white/10' : 'bg-panel-2 border border-line'}`}>
      {ind && (
        <span
          aria-hidden="true"
          className={`absolute top-1 bottom-1 rounded-md transition-[left,width] duration-300 ease-out-soft ${dark ? 'bg-white/[0.12]' : 'bg-panel border border-line shadow-[0_1px_2px_rgba(14,27,44,0.06)]'}`}
          style={{ left: ind.left, width: ind.width }}
        />
      )}
      {items.map(([key, text]) => (
        <button
          key={key}
          ref={(el) => { btns.current[key] = el; }}
          role="tab"
          aria-selected={value === key}
          onClick={() => onChange(key)}
          className={`relative px-3 py-1 text-xs rounded-md cursor-pointer transition-colors ${value === key ? (dark ? 'text-white' : 'text-ink font-medium') : (dark ? 'text-white/55 hover:text-white/85' : 'text-muted hover:text-ink')}`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

function SectionHeading({ id, title, children }) {
  return (
    <div className="max-w-2xl mb-12">
      <h2 id={id} className="text-[28px] sm:text-[36px] font-semibold tracking-[-0.02em] leading-[1.15] text-ink">{title}</h2>
      {children && <p className="mt-4 text-muted text-[15px] sm:text-base leading-relaxed">{children}</p>}
    </div>
  );
}

function Modal({ titleId, onClose, className = '', children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className={`bg-panel border border-line rounded-2xl w-full p-6 sm:p-8 shadow-[0_24px_64px_-16px_rgba(14,27,44,0.35)] relative max-h-[88vh] overflow-y-auto ${className}`}
      >
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 w-8 h-8 rounded-lg text-faint hover:text-ink hover:bg-panel-2 text-xl leading-none cursor-pointer">&times;</button>
        {children}
      </div>
    </div>
  );
}

function CodeBlock({ code }) {
  return (
    <pre className="dark-scroll p-5 font-mono text-[12px] leading-relaxed overflow-x-auto text-[#dfe6f1]">
      {code.split('\n').map((line, i) => {
        const hash = line.indexOf('# ');
        const isComment = hash !== -1 && !line.slice(0, hash).includes('"');
        return (
          <div key={i} className="min-h-[1em]">
            {isComment ? <>{line.slice(0, hash)}<span className="text-[#7f8ea6]">{line.slice(hash)}</span></> : line}
          </div>
        );
      })}
    </pre>
  );
}

// ---------------------------------------------------------------- hero demo
// A scripted, looping illustration of one run: a viewfinder locks onto what the agent acts on
// and a trace logs each step. Coordinates are mapped onto a 1440x900 viewport.
const DEMO_EMAIL = 'ada@example.com';
const DEMO_STEPS = [
  { kind: 'screenshot', target: 'stage', hold: 1300 },
  { kind: 'click', target: 'email', hold: 1100 },
  { kind: 'type', target: 'email', hold: 1500 },
  { kind: 'click', target: 'submit', hold: 1100 },
  { kind: 'screenshot', target: 'stage', hold: 1200 },
  { kind: 'verdict', target: 'toast', hold: 2800 }
];
const STATIC_LOG = ['screenshot', 'left_click (640, 412)', `type "${DEMO_EMAIL}"`, 'left_click (640, 520)', 'screenshot', 'VERDICT: PASS'];

function HeroDemo({ reducedMotion }) {
  const shellRef = useRef(null);
  const stageRef = useRef(null);
  const targets = useRef({});
  const visible = useInView(shellRef, { threshold: 0.3, once: false, rootMargin: '0px' });
  const [step, setStep] = useState(reducedMotion ? DEMO_STEPS.length - 1 : -1);
  const [typed, setTyped] = useState(reducedMotion ? DEMO_EMAIL.length : 0);
  const [frame, setFrame] = useState(null);
  const [log, setLog] = useState(reducedMotion ? STATIC_LOG : []);
  const running = visible && !reducedMotion;

  const measure = useCallback((index) => {
    const stage = stageRef.current;
    const s = DEMO_STEPS[index];
    if (!stage || !s) return null;
    const sr = stage.getBoundingClientRect();
    let rect;
    if (s.target === 'stage') {
      rect = { x: 8, y: 8, w: sr.width - 16, h: sr.height - 16 };
    } else {
      const el = targets.current[s.target];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      rect = { x: r.left - sr.left - 6, y: r.top - sr.top - 6, w: r.width + 12, h: r.height + 12 };
    }
    const cx = Math.round(((rect.x + rect.w / 2) / sr.width) * 1440);
    const cy = Math.round(((rect.y + rect.h / 2) / sr.height) * 900);
    const label = {
      screenshot: 'screenshot',
      click: `left_click (${cx}, ${cy})`,
      type: `type "${DEMO_EMAIL}"`,
      verdict: 'VERDICT: PASS'
    }[s.kind];
    // Label goes under the frame, above it when there is no room, or inside it for full-page screenshots.
    const place = s.target === 'stage' ? 'inside' : rect.y + rect.h + 30 < sr.height ? 'below' : 'above';
    return { ...rect, label, kind: s.kind, place };
  }, []);

  // Advance through the script while the demo is on screen; loop with a short reset.
  useEffect(() => {
    if (!running) return undefined;
    const hold = step === -1 ? 700 : DEMO_STEPS[step].hold;
    const timer = setTimeout(() => {
      if (step >= DEMO_STEPS.length - 1) {
        setStep(-1);
        setTyped(0);
        setLog([]);
      } else {
        setStep(step + 1);
      }
    }, hold);
    return () => clearTimeout(timer);
  }, [running, step]);

  useEffect(() => {
    if (!running || DEMO_STEPS[step]?.kind !== 'type') return undefined;
    const id = setInterval(() => setTyped((t) => (t < DEMO_EMAIL.length ? t + 1 : t)), 55);
    return () => clearInterval(id);
  }, [running, step]);

  // Lock the viewfinder onto the new target and log the step (measured after layout).
  useEffect(() => {
    if (step < 0) return undefined;
    const t = setTimeout(() => {
      const f = measure(step);
      setFrame(f);
      if (f && !reducedMotion) setLog((l) => [...l, f.label]);
    }, 0);
    return () => clearTimeout(t);
  }, [step, measure, reducedMotion]);

  useEffect(() => {
    const onResize = () => { if (step >= 0) setFrame(measure(step)); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [step, measure]);

  const current = DEMO_STEPS[step];
  const email = step > 2 ? DEMO_EMAIL : step === 2 ? DEMO_EMAIL.slice(0, typed) : '';
  const submitted = step >= 4;
  const pass = current?.kind === 'verdict';
  const set = (key) => (el) => { targets.current[key] = el; };

  return (
    <div ref={shellRef} className="relative">
      <div className="rounded-2xl border border-line bg-panel shadow-[0_1px_2px_rgba(14,27,44,0.04),0_24px_48px_-24px_rgba(14,27,44,0.18)] overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-3 px-4 h-10 border-b border-line bg-panel-2">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
            <span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
            <span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
          </div>
          <div className="flex-1 h-6 rounded-md bg-panel border border-line px-2.5 flex items-center text-[11px] font-mono text-muted truncate">app.example.com/signup</div>
          <span className="hidden sm:inline text-[11px] font-mono text-faint">1440×900</span>
        </div>

        {/* Mock page */}
        <div ref={stageRef} className="relative h-[300px] sm:h-[320px] px-6 py-5 select-none" aria-hidden="true">
          <div className="flex items-center justify-between text-[12px]">
            <span className="flex items-center gap-2 font-semibold text-ink"><span className="w-5 h-5 rounded-md bg-ink" />Acme</span>
            <span className="flex gap-4 text-muted"><span>Pricing</span><span>Docs</span><span>Log in</span></span>
          </div>
          <div className="mt-7 max-w-[300px]">
            <div className="text-[18px] font-semibold text-ink tracking-tight">Create your account</div>
            <div className="mt-1 text-[12px] text-muted">It takes less than a minute.</div>
            <div className="mt-5 text-[11px] font-medium text-muted">Work email</div>
            <div ref={set('email')} className={`mt-1.5 h-9 rounded-md border px-3 flex items-center font-mono text-[12.5px] transition-colors ${step >= 1 && step <= 2 ? 'border-accent' : 'border-line-strong'}`}>
              {email ? <span className="text-ink">{email}</span> : <span className="text-faint">name@company.com</span>}
              {step === 2 && <span className="caret ml-px w-px h-4 bg-ink" />}
            </div>
            <div ref={set('submit')} className={`mt-3 h-9 rounded-md bg-ink text-white text-[12.5px] font-medium flex items-center justify-center transition-[scale,opacity] duration-200 ${step === 3 ? 'scale-[0.97] opacity-90' : ''}`}>
              Create account
            </div>
          </div>
          <div
            ref={set('toast')}
            className={`absolute right-5 bottom-5 flex items-center gap-2 rounded-lg border border-pass/25 bg-pass-tint px-3 py-2 text-[12px] font-medium text-pass transition-[opacity,translate] duration-500 ease-out-soft ${submitted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
          >
            <Check className="w-3.5 h-3.5" /> Account created
          </div>

          {current?.kind === 'screenshot' && running && <div key={step} className="shutter absolute inset-0 bg-accent/[0.06] pointer-events-none" />}

          {frame && (
            <div
              className={`viewfinder absolute pointer-events-none ${pass ? 'text-pass' : 'text-accent'}`}
              style={{ left: frame.x, top: frame.y, width: frame.w, height: frame.h, opacity: step < 0 ? 0 : 1 }}
            >
              <span className="absolute inset-0 rounded-md bg-current opacity-[0.05]" />
              <span className="viewfinder-corner -left-px -top-px border-l-2 border-t-2 rounded-tl-md" />
              <span className="viewfinder-corner -right-px -top-px border-r-2 border-t-2 rounded-tr-md" />
              <span className="viewfinder-corner -left-px -bottom-px border-l-2 border-b-2 rounded-bl-md" />
              <span className="viewfinder-corner -right-px -bottom-px border-r-2 border-b-2 rounded-br-md" />
              <span
                className={`absolute left-0 whitespace-nowrap rounded-md px-2 py-0.5 font-mono text-[11px] text-white ${pass ? 'bg-pass' : 'bg-accent'}`}
                style={{ inside: { top: 8, left: 8 }, below: { top: 'calc(100% + 6px)' }, above: { bottom: 'calc(100% + 6px)' } }[frame.place]}
              >
                {frame.label}
              </span>
            </div>
          )}
        </div>

        {/* Trace */}
        <div className="bg-ink px-4 py-3 font-mono text-[11.5px] h-[164px] overflow-hidden">
          <div className="flex items-center justify-between text-white/45 mb-2">
            <span>trace</span>
            <span>{MODEL_ID}</span>
          </div>
          <ol className="space-y-1">
            {log.map((line, i) => {
              const isVerdict = line.startsWith('VERDICT');
              return (
                <li key={`${i}-${line}`} className="trace-in flex gap-3 text-white/80">
                  <span className="text-white/30 w-4 text-right">{i + 1}</span>
                  <span className={isVerdict ? 'text-[#5fd39b]' : ''}>{isVerdict ? line : `tool_use  ${line}`}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      <p className="mt-3 text-[12px] text-faint">Scripted illustration of a run, not a live model call.</p>
    </div>
  );
}

// ---------------------------------------------------------------- page
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
  const [cursor, setCursor] = useState(null);
  const [reducedMotion] = useState(prefersReducedMotion);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [navInd, setNavInd] = useState(null);

  const stageRef = useRef(null);
  const userInteracted = useRef(false);
  const targetRefs = useRef({});
  const navLinks = useRef({});
  const stepperRef = useRef(null);
  const stepperShown = useInView(stepperRef, { threshold: 0.4 });
  const setTarget = (key) => (el) => { targetRefs.current[key] = el; };

  const scenario = scenarios[selectedScenario];
  const steps = scenario.steps;
  const activeStep = stepIndex >= 0 ? steps[stepIndex] : null;

  // Header condenses once the page scrolls.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Track which section is in the middle of the viewport for the nav indicator.
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const sections = NAV.map(([id]) => document.getElementById(id)?.closest('section')).filter(Boolean);
    const inBand = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const id = e.target.getAttribute('aria-labelledby');
        if (e.isIntersecting) inBand.add(id);
        else inBand.delete(id);
      });
      // First nav section crossing the middle of the viewport; none while in the hero or the footer.
      setActiveSection(NAV.map(([id]) => id).find((id) => inBand.has(id)) ?? null);
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useLayoutEffect(() => {
    const measure = () => {
      const a = activeSection && navLinks.current[activeSection];
      setNavInd(a ? { left: a.offsetLeft, width: a.offsetWidth } : null);
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [activeSection]);

  useEffect(() => {
    if (!isRunning) return undefined;
    const timer = setTimeout(() => {
      if (stepIndex < steps.length - 1) setStepIndex((i) => i + 1);
      else setIsRunning(false);
    }, 1300);
    return () => clearTimeout(timer);
  }, [isRunning, stepIndex, steps.length]);

  // Move the mock cursor onto the element the current step acts on.
  useEffect(() => {
    const el = activeStep?.target && targetRefs.current[activeStep.target];
    const stage = stageRef.current;
    if (!el || !stage) {
      setCursor(null);
      return;
    }
    const s = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setCursor({ x: r.left - s.left + r.width * 0.5, y: r.top - s.top + r.height * 0.5 });
  }, [activeStep]);

  // Play the walkthrough once, the first time most of it scrolls into view,
  // unless the visitor has already picked a scenario or pressed Play.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || reducedMotion || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      if (userInteracted.current) return;
      setStepIndex(0);
      setIsRunning(true);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [reducedMotion]);

  const pickScenario = (key) => {
    userInteracted.current = true;
    setSelectedScenario(key);
    setStepIndex(-1);
    setIsRunning(false);
  };

  const runWalkthrough = () => {
    userInteracted.current = true;
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
    const subject = encodeURIComponent('SynapseQA');
    const body = encodeURIComponent(`Email: ${emailInput}\nProject / repo: ${projectInput || '-'}\n\nMessage:\n`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setIsModalOpen(false);
  };

  const closeDocs = () => setIsDocsOpen(false);
  const closeContact = () => setIsModalOpen(false);

  const capturing = isRunning && activeStep?.capture;
  const phoneScrolled = selectedScenario === 'layout' && stepIndex >= 1;
  const defectShown = selectedScenario === 'layout' && stepIndex >= 2;

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Banner */}
      <div className="bg-ink text-white/75 text-[12.5px]">
        <div className={`${container} py-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center`}>
          <span>Early stage and open source. The agent runs on Claude&apos;s <code className="font-mono text-white">{TOOLSET_ID}</code> computer use tool.</span>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition-colors">Read the code</a>
        </div>
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300 ${scrolled ? 'bg-panel/85 backdrop-blur-xl border-line shadow-[0_1px_0_rgba(14,27,44,0.02)]' : 'bg-canvas border-transparent'}`}>
        <div className={`${container} flex items-stretch justify-between transition-[height] duration-300 ease-out-soft ${scrolled ? 'h-14' : 'h-16'}`}>
          <a href="#top" className="flex items-center gap-2.5" aria-label="SynapseQA home">
            <span className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-ink">SynapseQA</span>
          </a>

          <nav aria-label="Sections" className="relative hidden md:flex items-stretch gap-7 text-[13.5px]">
            {NAV.map(([id, label]) => (
              <a
                key={id}
                ref={(el) => { navLinks.current[id] = el; }}
                href={`#${id}`}
                aria-current={activeSection === id ? 'true' : undefined}
                className={`flex items-center transition-colors ${activeSection === id ? 'text-ink' : 'text-muted hover:text-ink'}`}
              >
                {label}
              </a>
            ))}
            <button onClick={() => setIsDocsOpen(true)} className="flex items-center gap-1.5 text-muted hover:text-ink transition-colors cursor-pointer">
              <Code2 className="w-3.5 h-3.5" /> Docs
            </button>
            <span
              aria-hidden="true"
              className="absolute -bottom-px h-0.5 rounded-full bg-accent transition-[left,width,opacity] duration-300 ease-out-soft"
              style={navInd ? { left: navInd.left, width: navInd.width, opacity: 1 } : { left: 0, width: 0, opacity: 0 }}
            />
          </nav>

          <div className="flex items-center">
            <button onClick={() => setIsModalOpen(true)} className={`${primaryBtn} text-[13px] px-4 h-9 rounded-lg`}>
              Get in touch
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className={`${container} pt-16 sm:pt-20 pb-16`}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-14 items-center">
            <div>
              <h1 className="text-[40px] sm:text-[54px] font-semibold tracking-[-0.03em] leading-[1.04] text-ink">
                QA that reads the screen the way a user does.
              </h1>
              <p className="mt-6 text-[17px] sm:text-lg text-muted leading-relaxed max-w-xl">
                SynapseQA lets Claude drive a real browser from screenshots. You describe a journey in plain English;
                the agent clicks, types and scrolls, then reports PASS or FAIL with what it saw. No CSS or XPath selectors to maintain.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a href={REPO_URL} target="_blank" rel="noreferrer" className={`${primaryBtn} px-5 h-11 rounded-lg text-[14.5px]`}>
                  View on GitHub <ArrowUpRight className="w-4 h-4" />
                </a>
                <a href="#how-it-works" className={`${secondaryBtn} px-5 h-11 rounded-lg text-[14.5px]`}>
                  See how it works
                </a>
              </div>
              <p className="mt-6 flex items-center gap-2 text-[13px] text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-pass" />
                Open source under MIT. Runs with your own Anthropic API key.
              </p>
            </div>

            <HeroDemo reducedMotion={reducedMotion} />
          </div>

          {/* Quickstart and facts */}
          <div className="mt-20 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
            <Reveal variant="clip" frame="rounded-2xl bg-ink overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-white/10">
                <SegTabs dark label="Quickstart" items={Object.entries(quickstarts).map(([k, q]) => [k, q.label])} value={quickstartTab} onChange={setQuickstartTab} />
                <button
                  onClick={copyQuickstart}
                  className="h-7 px-2.5 rounded-md border border-white/15 hover:bg-white/10 text-white/80 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-[11.5px]"
                  aria-label="Copy snippet"
                >
                  {copiedCode ? <><Check className="w-3.5 h-3.5 text-[#5fd39b]" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
              <pre key={quickstartTab} className="dark-scroll trace-in p-4 font-mono text-[12px] text-[#dfe6f1] whitespace-pre overflow-x-auto leading-relaxed"><span className="text-white/35 select-none">$ </span>{quickstarts[quickstartTab].code}</pre>
              <div className="px-4 pb-3 text-[11.5px] text-white/45">Needs Node 20+, Python 3.10+ and your own ANTHROPIC_API_KEY.</div>
            </Reveal>

            {/* Facts: things that are true of the repository, not marketing metrics */}
            <dl className="rounded-2xl border border-line bg-panel divide-y divide-line self-start">
              {[
                ['Model', MODEL_ID],
                ['Computer use tool', TOOLSET_ID],
                ['Browser', 'Playwright Chromium'],
                ['Tests', '12 offline, run in CI']
              ].map(([label, value]) => (
                <div key={label} className="px-5 py-3.5 flex items-baseline justify-between gap-4">
                  <dt className="text-[13px] text-muted shrink-0">{label}</dt>
                  <dd className="text-[12.5px] font-mono text-ink text-right break-all">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-it-works" className="border-t border-line bg-panel">
          <div className={`${container} py-24`}>
            <SectionHeading id="how-it-works" title="One loop, four moving parts">
              Claude never sees the DOM. It sees a screenshot, asks for an action, and sees the result.
            </SectionHeading>

            <Reveal variant="scale" className="rounded-2xl border border-line overflow-hidden bg-panel">
              <Suspense fallback={<div className="w-full aspect-[480/744] sm:aspect-[960/400]" />}>
                <LoopPlayer reducedMotion={reducedMotion} />
              </Suspense>
            </Reveal>
            <p className="mt-3 text-[12px] text-faint">Animated illustration of the loop in <code className="font-mono">agent/computer_use.py</code>, not a recording of a run.</p>

            {/* A real sequence, so it is numbered; the rail draws in once */}
            <ol ref={stepperRef} className="relative mt-14 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
              <span
                aria-hidden="true"
                className={`hidden md:block absolute left-4 top-4 h-px bg-line-strong origin-left transition-[scale] duration-[1400ms] ease-out-soft ${stepperShown ? 'scale-x-100' : 'scale-x-0'}`}
                style={{ right: 'calc((100% - 4.5rem) / 4 - 1rem)' }}
              />
              {howSteps.map(([title, text], i) => (
                <li
                  key={title}
                  className={`relative transition-[opacity,translate] duration-700 ease-out-soft ${stepperShown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                  style={{ transitionDelay: `${200 + i * 160}ms` }}
                >
                  <span className="relative z-10 flex w-8 h-8 items-center justify-center rounded-full border border-accent/40 bg-panel text-accent text-[13px] font-mono">{i + 1}</span>
                  <h3 className="mt-4 text-[15px] font-semibold text-ink">{title}</h3>
                  <p className="mt-1.5 text-[14px] text-muted leading-relaxed">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Walkthrough */}
        <section aria-labelledby="walkthrough" className="border-t border-line">
          <div className={`${container} py-24`}>
            <SectionHeading id="walkthrough" title="What a run looks like">
              A scripted illustration, not a live model call. To see real traces, run the open-source agent with your own key.
            </SectionHeading>

            <Reveal className="rounded-2xl border border-line bg-panel overflow-hidden">
              <div className="border-b border-line px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <SegTabs label="Scenario" items={Object.entries(scenarios).map(([k, s]) => [k, s.label])} value={selectedScenario} onChange={pickScenario} />
                <button
                  onClick={runWalkthrough}
                  disabled={isRunning}
                  className={`h-8 px-3.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${isRunning ? 'bg-panel-2 text-faint cursor-not-allowed' : 'bg-accent hover:bg-accent-strong text-white cursor-pointer'}`}
                >
                  {isRunning ? (<><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Playing</>) : (<><Play className="w-3.5 h-3.5 fill-current" /> {stepIndex >= 0 ? 'Replay' : 'Play walkthrough'}</>)}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left: mock page */}
                <div className="lg:col-span-6 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-line bg-canvas">
                  <div ref={stageRef} className="relative h-full min-h-[440px] flex items-center justify-center">
                    {selectedScenario === 'checkout' ? (
                      <div className="w-full max-w-sm rounded-xl border border-line bg-panel overflow-hidden shadow-[0_1px_2px_rgba(14,27,44,0.04)]">
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-line text-[11px] font-mono text-faint">
                          <span>example-store.test/cart</span>
                          <span>{scenario.viewport}</span>
                        </div>
                        <div className="p-4 space-y-3 text-xs">
                          <div className="p-3 rounded-lg bg-panel-2 flex justify-between items-center">
                            <span className="font-medium text-ink">Team plan &times; 5 seats</span>
                            <span className="font-mono text-ink-2">$120.00</span>
                          </div>
                          <div className="p-3 rounded-lg bg-panel-2 space-y-2">
                            <span className="text-[11px] text-muted block">Promo code</span>
                            <div className="flex gap-2">
                              <div ref={setTarget('field')} className={`w-full bg-panel border rounded-md px-2.5 py-1.5 text-xs font-mono transition-colors ${stepIndex >= 1 && stepIndex <= 2 ? 'border-accent' : 'border-line-strong'} ${stepIndex >= 2 ? 'text-ink' : 'text-faint'}`}>
                                {stepIndex >= 2 ? 'SPRING25' : 'Enter code'}
                              </div>
                              <span ref={setTarget('apply')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${stepIndex >= 3 ? 'bg-pass text-white' : 'bg-ink text-white'}`}>
                                {stepIndex >= 3 ? 'Applied' : 'Apply'}
                              </span>
                            </div>
                          </div>
                          <div ref={setTarget('total')} className={`rounded-lg px-3 py-2.5 flex justify-between font-medium border transition-colors ${stepIndex === 4 ? 'border-accent' : 'border-transparent'}`}>
                            <span className="text-muted">Total</span>
                            <span className="text-ink font-mono text-sm">{stepIndex >= 3 ? '$90.00' : '$120.00'}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div ref={setTarget('phone')} className="relative w-[220px] rounded-[28px] bg-ink p-2.5">
                        <div className="text-[10px] font-mono text-white/50 text-center pb-1.5">{scenario.viewport}</div>
                        <div className="relative h-[360px] rounded-[20px] bg-panel overflow-hidden">
                          <div className="absolute inset-x-0 top-0 h-[560px] transition-[translate] duration-700 ease-out-soft" style={{ translate: `0 ${phoneScrolled ? -200 : 0}px` }}>
                            <div className="p-3 space-y-2 text-[11px]">
                              <div className="text-ink font-medium pb-1">Order summary</div>
                              {['Desk lamp', 'Notebook × 2', 'Cable set', 'Monitor arm', 'Shipping'].map((item) => (
                                <div key={item} className="flex justify-between p-2.5 rounded-lg bg-panel-2 text-muted">
                                  <span>{item}</span><span className="font-mono">$—</span>
                                </div>
                              ))}
                              <div className="flex justify-between px-1 pt-2 text-ink font-medium"><span>Total</span><span className="font-mono">$184.00</span></div>
                            </div>
                            <div className="absolute left-3 right-3 bottom-10 h-11 rounded-lg bg-ink text-white text-xs font-medium flex items-center justify-center">Place order</div>
                          </div>
                          <div className="absolute inset-x-0 bottom-0 h-14 bg-panel border-t border-line flex items-center justify-around text-[10px] text-faint">
                            <span>Home</span><span>Search</span><span>Cart</span><span>Account</span>
                          </div>
                          <div
                            ref={setTarget('overlap')}
                            className={`absolute left-2 right-2 top-[268px] h-[64px] rounded-lg border-2 border-dashed border-fail transition-opacity duration-500 ${defectShown ? 'opacity-100' : 'opacity-0'}`}
                          />
                        </div>
                        {defectShown && (
                          <div className="trace-in absolute -right-3 top-[250px] translate-x-full max-w-[150px] hidden sm:block text-[10.5px] leading-snug text-fail bg-fail-tint border border-fail/25 rounded-md px-2 py-1.5">
                            Button hidden behind the fixed bottom bar
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`pointer-events-none absolute inset-0 rounded-xl border-2 border-accent/60 transition-opacity duration-300 ${capturing ? 'opacity-100' : 'opacity-0'}`} />
                    {capturing && (
                      <span className="absolute top-2 left-2 text-[10.5px] font-mono text-white bg-accent rounded px-1.5 py-0.5">screenshot</span>
                    )}

                    {cursor && (
                      <div
                        className="absolute pointer-events-none z-30 transition-[left,top] duration-700 ease-out-soft"
                        style={{ left: cursor.x, top: cursor.y }}
                        aria-hidden="true"
                      >
                        <MousePointer2 className="w-5 h-5 text-ink fill-white drop-shadow" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: trace */}
                <div className="lg:col-span-6 p-5 sm:p-6">
                  <div className="mb-4">
                    <SegTabs label="Trace view" items={[['stream', 'Step trace'], ['api', 'Request shape']]} value={telemetryTab} onChange={setTelemetryTab} />
                  </div>

                  {telemetryTab === 'stream' ? (
                    <ol className="space-y-2">
                      {steps.map((step, idx) => {
                        const reached = stepIndex > idx || (!isRunning && stepIndex === steps.length - 1);
                        const current = isRunning && stepIndex === idx;
                        return (
                          <li key={step.title} className={`p-3 rounded-lg border text-xs transition-[background-color,border-color,opacity] duration-300 ${current ? 'bg-accent-tint border-accent/40' : reached ? 'bg-panel border-line' : 'border-line opacity-50'}`}>
                            <div className="flex items-center gap-2">
                              {reached || (current && step.done) ? (
                                step.warn ? <AlertTriangle className="w-4 h-4 text-fail shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-pass shrink-0" />
                              ) : current ? (
                                <RefreshCw className="w-4 h-4 text-accent animate-spin shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-line-strong shrink-0" />
                              )}
                              <span className={`font-mono font-medium ${current ? 'text-accent' : reached ? 'text-ink' : 'text-faint'}`}>{step.title}</span>
                            </div>
                            <p className="mt-1 text-[12px] text-muted pl-6 leading-relaxed">{step.detail}</p>
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <div className="trace-in p-4 rounded-lg bg-ink font-mono text-[11.5px] text-[#dfe6f1] overflow-x-auto">
                      <div className="text-[#7f8ea6] mb-2">{'# What agent/computer_use.py sends each turn'}</div>
                      <pre className="leading-relaxed">{`client.messages.create(
  model="${MODEL_ID}",
  tools=[{"type": "${TOOLSET_ID}"}],
  system=[{ ..., "cache_control": {"type": "ephemeral"} }],
  messages=[goal, assistant tool_use,
            user tool_result(screenshot), ...]
)`}</pre>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Under the hood */}
        <section aria-labelledby="code" className="border-t border-line bg-panel">
          <div className={`${container} py-24`}>
            <SectionHeading id="code" title="The whole agent is one readable loop">
              About 300 lines of Python. This is the core of it, abridged from the repository.
            </SectionHeading>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <Reveal variant="clip" className="lg:col-span-7 self-start" frame="rounded-2xl bg-ink overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 text-[11.5px] font-mono">
                  <span className="text-white/55">agent/computer_use.py, run_audit()</span>
                  <a href={`${ENGINE_URL}#L243-L299`} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white flex items-center gap-1 transition-colors">
                    Full source <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
                <CodeBlock code={loopExcerpt} />
              </Reveal>

              <ul className="lg:col-span-5 divide-y divide-line">
                {loopNotes.map(([Icon, title, text], i) => (
                  <li key={title} className="py-5 first:pt-0 flex gap-4">
                    <DrawIcon icon={Icon} delay={i * 120} className="w-5 h-5 mt-0.5 text-accent shrink-0" />
                    <div>
                      <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
                      <p className="mt-1 text-[14px] text-muted leading-relaxed">{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 pt-6 border-t border-line flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px] text-muted">
              <a href={CI_URL} target="_blank" rel="noreferrer" className="flex items-center" aria-label="CI status on GitHub Actions">
                <img src={`${CI_URL}/badge.svg`} alt="CI status" height="20" className="h-5" />
              </a>
              <a href={TESTS_URL} target="_blank" rel="noreferrer" className="hover:text-ink transition-colors"><span className="text-ink font-medium">12 offline tests</span> with a scripted fake Claude client</a>
              <span>Lint and build on Node 20 and 22</span>
              <span>CLI dry run in CI, no model call</span>
            </div>
          </div>
        </section>

        {/* Who it is for */}
        <section aria-labelledby="who" className="border-t border-line">
          <div className={`${container} py-24`}>
            <SectionHeading id="who" title="Small teams with a UI and no end-to-end suite">
              Most small teams ship a web app without anyone owning end-to-end tests. SynapseQA is a cheap
              &ldquo;does the main journey still work, and does it look right?&rdquo; check you write in one sentence and run on a preview
              deploy or in CI, next to your deterministic tests rather than instead of them.
            </SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                ['The problem', 'Hand-written selector tests are costly to write and break on every UI refactor, so small teams skip them and find regressions in production.'],
                ['The approach', 'Describe a journey in plain English. Claude looks at real screenshots, acts, and reports PASS or FAIL with evidence. No selectors to maintain.'],
                ['The limits', 'It is slower and less deterministic than scripted tests, and costs a model call per step. Good for smoke and visual checks, not a regression suite.']
              ].map(([title, text]) => (
                <div key={title} className="border-t-2 border-ink pt-5">
                  <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
                  <p className="mt-2 text-[14px] text-muted leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            <Reveal variant="clip" className="mt-14" frame="rounded-2xl bg-ink overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 text-[11.5px] font-mono text-white/55">
                Result format: an illustration of the shape, not output from a real run
              </div>
              <pre className="dark-scroll p-5 font-mono text-[12px] text-[#dfe6f1] overflow-x-auto leading-relaxed">{`{
  "target": "https://example.com",
  "status": "FAIL",
  "steps": [
    {"index": 1, "tool": "screenshot", "error": null},
    {"index": 2, "tool": "left_click", "input": {"coordinate": [640, 412]}}
  ],
  "report": "The Sign up button is partly covered by the cookie bar...\\nVERDICT: FAIL",
  "usage": {"input_tokens": …, "output_tokens": …, "cache_read_input_tokens": …}
}`}</pre>
            </Reveal>
          </div>
        </section>

        {/* Status */}
        <section aria-labelledby="status" className="border-t border-line bg-panel">
          <div className={`${container} py-24`}>
            <SectionHeading id="status" title="What exists today, and what doesn't">
              We have not published cost, latency or accuracy figures because we have not measured them yet.
            </SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-line p-6 sm:p-7">
                <h3 className="text-[15px] font-semibold text-ink mb-5">In the repo today</h3>
                <ul className="space-y-3.5 text-[14px] text-ink-2">
                  {works.map((item, i) => (
                    <li key={item} className="flex gap-3">
                      <DrawIcon icon={Check} delay={i * 110} strokeWidth={2.25} className="w-4 h-4 mt-0.5 text-pass shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-dashed border-line-strong p-6 sm:p-7">
                <h3 className="text-[15px] font-semibold text-ink mb-5">Next</h3>
                <ul className="space-y-3.5 text-[14px] text-muted">
                  {planned.map((item) => (
                    <li key={item} className="flex gap-3"><Circle className="w-4 h-4 mt-0.5 text-line-strong shrink-0" strokeDasharray="3 3" />{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Why Claude */}
        <section aria-labelledby="why-claude" className="border-t border-line">
          <div className={`${container} py-24`}>
            <SectionHeading id="why-claude" title="Built on the parts of the API that make this possible" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                [Eye, 'Pixels, not selectors', 'Claude decides what to do from the screenshot itself, so a renamed CSS class or a reshuffled DOM does not break a test. It can also notice what a selector never would, like a button hidden under a bar.'],
                [MessageSquareText, 'Plain-English goals', 'The test is a sentence, not a script. That makes it cheap to write exploratory and smoke checks that would never justify a hand-coded suite.'],
                [Gauge, 'Usage reporting', 'Each run returns the token usage reported by the API, including cache creation and cache read counts, so you can see what a run costs. The system prompt is marked cacheable with cache_control: ephemeral.']
              ].map(([Icon, title, text], i) => (
                <div key={title}>
                  <span className="flex w-11 h-11 items-center justify-center rounded-xl bg-accent-tint text-accent">
                    <DrawIcon icon={Icon} delay={i * 150} className="w-5 h-5" />
                  </span>
                  <h3 className="mt-5 text-[16px] font-semibold text-ink">{title}</h3>
                  <p className="mt-2 text-[14px] text-muted leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section aria-labelledby="comparison" className="border-t border-line bg-panel">
          <div className={`${container} py-24`}>
            <SectionHeading id="comparison" title="Where it fits next to Playwright and Cypress">
              Use both: SynapseQA for the checks nobody writes, scripted tests for the ones that must be exact.
            </SectionHeading>
            <div className="rounded-2xl border border-line overflow-x-auto">
              <table className="w-full text-left text-[13px] sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-line bg-panel-2 text-[12.5px] text-muted">
                    <th scope="col" className="py-3.5 px-6 font-medium"><span className="sr-only">Criterion</span></th>
                    <th scope="col" className="py-3.5 px-6 font-semibold text-accent bg-accent-tint">SynapseQA</th>
                    <th scope="col" className="py-3.5 px-6 font-medium">Scripted (Playwright / Cypress)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-ink-2">
                  {[
                    ['Writing a test', 'One sentence', 'Code and a selector for every step'],
                    ['After a redesign', 'The same sentence still runs', 'Selectors need updating'],
                    ['Visual bugs (overlap, clipping)', 'Reported from the screenshot', 'Missed unless you wrote an assertion for it'],
                    ['Who can write one', 'Anyone who can describe the journey', 'An engineer who knows the framework'],
                    ['Each run', 'A model call per step, so slower', 'Fast and repeatable'],
                    ['Best for', 'Smoke and visual checks on every deploy', 'Exact, repeatable regression checks']
                  ].map(([row, a, b]) => (
                    <tr key={row} className="hover:bg-canvas/60 transition-colors">
                      <th scope="row" className="py-4 px-6 font-medium text-ink">{row}</th>
                      <td className="py-4 px-6 bg-accent-tint/40">{a}</td>
                      <td className="py-4 px-6 text-muted">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Closing call to action */}
        <section className={`${container} py-20`}>
          <Reveal variant="scale" className="rounded-3xl bg-ink px-6 py-14 sm:px-14 grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-8 items-center">
            <div>
              <h2 className="text-[28px] sm:text-[34px] font-semibold tracking-[-0.02em] leading-tight text-white">Try it on your own app</h2>
              <p className="mt-3 text-white/65 text-[15px] leading-relaxed max-w-lg">
                Clone the repo, set your API key and describe one journey. If it misses something or gets it wrong, that is exactly the feedback we want.
              </p>
            </div>
            <div className="flex flex-wrap md:justify-end gap-3">
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-white text-ink font-medium text-[14.5px] hover:bg-white/90 active:scale-[0.98] transition-[background-color,scale]">
                View on GitHub <ArrowUpRight className="w-4 h-4" />
              </a>
              <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center h-11 px-5 rounded-lg border border-white/25 text-white font-medium text-[14.5px] hover:bg-white/10 active:scale-[0.98] transition-[background-color,scale] cursor-pointer">
                Get in touch
              </button>
            </div>
          </Reveal>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line py-10 text-[13px] text-muted">
        <div className={`${container} flex flex-col sm:flex-row items-center justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-md bg-accent flex items-center justify-center text-white">
              <Eye className="w-3.5 h-3.5" />
            </span>
            <span className="font-medium text-ink">SynapseQA</span>
            <span>MIT licensed, &copy; 2026 Yakup Ak&ccedil;ay</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#walkthrough" className="hover:text-ink transition-colors">Walkthrough</a>
            <button onClick={() => setIsDocsOpen(true)} className="hover:text-ink transition-colors cursor-pointer">Docs</button>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="hover:text-ink transition-colors">GitHub</a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-ink transition-colors">{CONTACT_EMAIL}</a>
          </div>
        </div>
      </footer>

      {/* Docs modal */}
      {isDocsOpen && (
        <Modal titleId="docs-title" onClose={closeDocs} className="max-w-3xl">
          <h3 id="docs-title" className="text-2xl font-semibold text-ink mb-6">Using SynapseQA</h3>

          <div className="space-y-6 text-left">
            <div>
              <h4 className="text-[13px] font-semibold text-ink mb-2">CLI flags</h4>
              <pre className="dark-scroll p-4 rounded-xl bg-ink font-mono text-[12px] text-[#dfe6f1] overflow-x-auto leading-relaxed">{`--target=<url>        page to test (required)
--goal="<sentence>"   what the agent should try
--max-steps=12        cap on model turns
--model=${MODEL_ID}
--dry-run             no model call, no browser

exit code: 0 = PASS or --dry-run, 1 = FAIL or INCONCLUSIVE,
            2 = error (including a missing ANTHROPIC_API_KEY)`}</pre>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-ink mb-2">Tests (no network needed)</h4>
              <pre className="dark-scroll p-4 rounded-xl bg-ink font-mono text-[12px] text-[#dfe6f1] overflow-x-auto leading-relaxed">{`cd agent && python -m unittest -v`}</pre>
            </div>
            <p className="text-[13px] text-muted leading-relaxed">
              The agent returns <code className="font-mono text-ink">status</code>, the step list, the model&apos;s written report and the token usage
              reported by the API (including <code className="font-mono text-ink">cache_read_input_tokens</code>).
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-line flex justify-between items-center">
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-[13px] text-accent hover:text-accent-strong font-medium inline-flex items-center gap-1">View source on GitHub <ArrowUpRight className="w-3.5 h-3.5" /></a>
            <button onClick={closeDocs} className={`${primaryBtn} px-5 h-9 rounded-lg text-[13px]`}>Done</button>
          </div>
        </Modal>
      )}

      {/* Contact modal: opens the visitor's email client; nothing is stored by the site */}
      {isModalOpen && (
        <Modal titleId="contact-title" onClose={closeContact} className="max-w-md">
          <h3 id="contact-title" className="text-xl font-semibold text-ink mb-1">Get in touch</h3>
          <p className="text-[13px] text-muted mb-5 leading-relaxed">
            Feedback, a bug report, or a site you would like to try it on? Send a note to {CONTACT_EMAIL}. This opens your email client; if nothing happens, write to the address directly.
          </p>
          <form onSubmit={submitEarlyAccess} className="space-y-4">
            <div>
              <label htmlFor="contact-email" className="text-[13px] font-medium text-ink block mb-1.5">Your email</label>
              <input id="contact-email" type="email" required autoFocus placeholder="you@yourcompany.com" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="w-full bg-panel border border-line-strong rounded-lg px-3 py-2 text-sm text-ink placeholder:text-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-shadow" />
            </div>
            <div>
              <label htmlFor="contact-project" className="text-[13px] font-medium text-ink block mb-1.5">Site or repo to test (optional)</label>
              <input id="contact-project" type="text" placeholder="https://github.com/your-org/webapp" value={projectInput} onChange={(e) => setProjectInput(e.target.value)} className="w-full bg-panel border border-line-strong rounded-lg px-3 py-2 text-sm text-ink placeholder:text-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-shadow" />
            </div>
            <button type="submit" className={`${primaryBtn} w-full justify-center h-10 rounded-lg text-sm`}>
              Compose email
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
