import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

// Illustrative animation of the loop in agent/computer_use.py. Every frame is driven by
// useCurrentFrame(); no CSS transitions, so it renders the same in the Player and in a render.
// Two layouts share the timeline: side by side for wide screens, stacked for phones.

export const AGENT_LOOP_FPS = 30;
export const WIDE_W = 960;
export const WIDE_H = 400;
export const TALL_W = 480;
export const TALL_H = 744;

const ROUND = 66; // frames per request/response round trip
const SEND = [0, 24]; // browser -> Claude, inside a round
const RETURN = [33, 57]; // Claude -> browser, inside a round

// What travels on each lane. The last round has no tool_use: Claude ends the turn with a report.
const ROUNDS = [
  { up: 'user · goal + viewport', down: 'tool_use · screenshot' },
  { up: 'tool_result · image', down: 'tool_use · left_click (612, 388)' },
  { up: 'tool_result · OK', down: 'tool_use · type "SPRING25"' },
  { up: 'tool_result · OK', down: 'tool_use · screenshot' },
  { up: 'tool_result · image', down: null }
];

const VERDICT_AT = (ROUNDS.length - 1) * ROUND + SEND[1] + 10;
export const AGENT_LOOP_DURATION = VERDICT_AT + 90;

const C = {
  bg: '#ffffff',
  box: '#f6f7f9',
  line: '#cfd6df',
  text: '#0e1b2c',
  muted: '#5b6676',
  dim: '#8a94a3',
  accent: '#2d5be3',
  pass: '#17855a'
};
const mono = '"IBM Plex Mono", ui-monospace, monospace';
const sans = '"IBM Plex Sans", system-ui, sans-serif';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
const ease = Easing.bezier(0.45, 0, 0.2, 1);

// Geometry per layout. A lane runs from `from` to `to` along its axis at a fixed cross position;
// its label sits at `label`.
const LAYOUTS = {
  wide: {
    font: 14,
    browser: { x: 36, y: 96, w: 270, h: 180 },
    claude: { x: 654, y: 96, w: 270, h: 180 },
    up: { axis: 'x', from: 318, to: 642, at: 148, label: [480, 148] },
    down: { axis: 'x', from: 642, to: 318, at: 224, label: [480, 224] },
    verdictY: 312
  },
  tall: {
    font: 16,
    browser: { x: 32, y: 64, w: 416, h: 172 },
    claude: { x: 32, y: 488, w: 416, h: 172 },
    up: { axis: 'y', from: 248, to: 476, at: 150, label: [240, 326] },
    down: { axis: 'y', from: 476, to: 248, at: 330, label: [240, 398] },
    verdictY: 684
  }
};

function Lane({ lane }) {
  const horizontal = lane.axis === 'x';
  const lo = Math.min(lane.from, lane.to);
  const len = Math.abs(lane.to - lane.from);
  const forward = lane.to > lane.from;
  const arrow = horizontal
    ? { top: lane.at - 8, left: forward ? lane.to - 12 : lane.to, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', [forward ? 'borderLeft' : 'borderRight']: `12px solid ${C.line}` }
    : { left: lane.at - 8, top: forward ? lane.to - 12 : lane.to, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', [forward ? 'borderTop' : 'borderBottom']: `12px solid ${C.line}` };
  return (
    <>
      <div
        style={horizontal
          ? { position: 'absolute', left: lo, top: lane.at - 1, width: len, borderTop: `2px dashed ${C.line}` }
          : { position: 'absolute', top: lo, left: lane.at - 1, height: len, borderLeft: `2px dashed ${C.line}` }}
      />
      <div style={{ position: 'absolute', width: 0, height: 0, ...arrow }} />
    </>
  );
}

// A dot travels the lane while its label fades in at the lane's label point.
function Packet({ label, lane, start, font }) {
  const frame = useCurrentFrame();
  const end = start + (SEND[1] - SEND[0]);
  const pos = interpolate(frame, [start, end], [lane.from, lane.to], { ...clamp, easing: ease });
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 12,
          height: 12,
          marginLeft: -6,
          marginTop: -6,
          borderRadius: 999,
          background: C.accent,
          translate: lane.axis === 'x' ? `${pos}px ${lane.at}px` : `${lane.at}px ${pos}px`,
          opacity: interpolate(frame, [start - 1, start + 3, end - 2, end + 2], [0, 1, 1, 0], clamp)
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: lane.label[0],
          top: lane.label[1],
          opacity: interpolate(frame, [start - 1, start + 5, end + 4, end + 10], [0, 1, 1, 0], clamp),
          translate: `0px ${interpolate(frame, [start - 1, start + 8], [6, 0], { ...clamp, easing: ease })}px`
        }}
      >
        <div
          style={{
            translate: '-50% -50%',
            whiteSpace: 'nowrap',
            padding: '6px 12px',
            borderRadius: 999,
            background: '#ffffff',
            border: `1.5px solid ${C.accent}`,
            color: C.text,
            fontFamily: mono,
            fontSize: font
          }}
        >
          {label}
        </div>
      </div>
    </>
  );
}

// Lights a box's outline briefly when a packet lands on it.
function ArrivalGlow({ arrivals }) {
  const frame = useCurrentFrame();
  const last = arrivals.filter((a) => a <= frame).pop();
  const opacity = last === undefined ? 0 : interpolate(frame, [last, last + 4, last + 22], [0, 1, 0], clamp);
  return <div style={{ position: 'absolute', inset: -1.5, borderRadius: 18, border: `2px solid ${C.accent}`, opacity }} />;
}

function Box({ rect, font, title, lines, arrivals, children }) {
  return (
    <div style={{ position: 'absolute', left: rect.x, top: rect.y, width: rect.w, height: rect.h, borderRadius: 18, background: C.box, border: `1.5px solid ${C.line}`, padding: '18px 22px', boxSizing: 'border-box' }}>
      <ArrivalGlow arrivals={arrivals} />
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: font + 10, color: C.text }}>{title}</div>
      {lines.map((l) => (
        <div key={l} style={{ fontFamily: mono, fontSize: font, color: C.muted, marginTop: 5 }}>{l}</div>
      ))}
      <div style={{ position: 'absolute', left: 22, right: 22, bottom: 16, fontFamily: mono, fontSize: font, color: C.dim }}>{children}</div>
    </div>
  );
}

function LastAction() {
  const frame = useCurrentFrame();
  const done = ROUNDS.filter((r, i) => r.down && frame >= i * ROUND + RETURN[1]);
  const current = done.length ? done[done.length - 1].down.replace('tool_use · ', '') : '—';
  return <>ran: <span style={{ color: C.text }}>{current}</span></>;
}

function TurnCounter() {
  const frame = useCurrentFrame();
  const turn = Math.min(ROUNDS.length, Math.floor(frame / ROUND) + 1);
  return <>messages.create · turn <span style={{ color: C.text }}>{turn}</span></>;
}

function Verdict({ y, font }) {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: y,
        display: 'flex',
        justifyContent: 'center',
        opacity: interpolate(frame, [VERDICT_AT, VERDICT_AT + 12], [0, 1], clamp),
        translate: `0px ${interpolate(frame, [VERDICT_AT, VERDICT_AT + 16], [10, 0], { ...clamp, easing: ease })}px`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderRadius: 12, background: C.box, border: `1.5px solid ${C.line}`, fontFamily: mono, fontSize: font + 2, color: C.muted, whiteSpace: 'nowrap' }}>
        <span style={{ width: 10, height: 10, borderRadius: 999, background: C.pass }} />
        report ends with <span style={{ color: C.text }}>VERDICT: PASS</span>
      </div>
    </div>
  );
}

export function AgentLoop({ layout = 'wide' }) {
  const g = LAYOUTS[layout];
  const ups = ROUNDS.map((r, i) => i * ROUND + SEND[1]);
  const downs = ROUNDS.filter((r) => r.down).map((r, i) => i * ROUND + RETURN[1]);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: 'absolute', left: g.browser.x, top: layout === 'wide' ? 34 : 24, fontFamily: mono, fontSize: g.font, color: C.dim, letterSpacing: 0 }}>
        Agent loop, illustrated
      </div>

      <Box rect={g.browser} font={g.font} title="Browser" lines={['Playwright · Chromium', '1440×900 viewport']} arrivals={downs}>
        <LastAction />
      </Box>
      <Box rect={g.claude} font={g.font} title="Claude" lines={['claude-sonnet-5-5', 'computer_toolset_20260801']} arrivals={ups}>
        <TurnCounter />
      </Box>

      <Lane lane={g.up} />
      <Lane lane={g.down} />

      {ROUNDS.map((r, i) => (
        <Packet key={`up-${i}`} label={r.up} lane={g.up} font={g.font} start={i * ROUND + SEND[0]} />
      ))}
      {ROUNDS.map((r, i) => r.down && (
        <Packet key={`down-${i}`} label={r.down} lane={g.down} font={g.font} start={i * ROUND + RETURN[0]} />
      ))}

      <Verdict y={g.verdictY} font={g.font} />
    </AbsoluteFill>
  );
}
