import { AbsoluteFill } from 'remotion';
import { loadFont as loadSans } from '@remotion/google-fonts/IBMPlexSans';
import { loadFont as loadMono } from '@remotion/google-fonts/IBMPlexMono';
import { AgentLoop, WIDE_W, WIDE_H } from './AgentLoop';

// Social preview card (public/og.png). It shares AgentLoop's timeline; `npm run og` renders the last frame.
loadSans('normal', { weights: ['400', '600'], subsets: ['latin'] });
loadMono('normal', { weights: ['400'], subsets: ['latin'] });

export const OG_W = 1200;
export const OG_H = 630;
const LOOP_SCALE = 0.92;

export function OgImage() {
  return (
    <AbsoluteFill style={{ background: '#f6f7f9', fontFamily: '"IBM Plex Sans", sans-serif' }}>
      <div style={{ position: 'absolute', left: 64, top: 52, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#2d5be3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <div style={{ fontSize: 26, fontWeight: 600, color: '#0e1b2c', letterSpacing: -0.5 }}>
          SynapseQA
        </div>
      </div>

      <div style={{ position: 'absolute', left: 64, right: 64, top: 118, fontSize: 50, fontWeight: 600, color: '#0e1b2c', letterSpacing: -1.6, lineHeight: 1.08 }}>
        QA that reads the screen the way a user does.
      </div>
      <div style={{ position: 'absolute', left: 64, top: 186, fontFamily: '"IBM Plex Mono", monospace', fontSize: 18, color: '#5b6676' }}>
        Open-source browser QA on Claude computer use and Playwright
      </div>

      <div
        style={{
          position: 'absolute',
          left: (OG_W - WIDE_W * LOOP_SCALE) / 2,
          top: 230,
          width: WIDE_W,
          height: WIDE_H,
          scale: LOOP_SCALE,
          transformOrigin: 'top left',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1.5px solid #e3e7ec'
        }}
      >
        <AgentLoop layout="wide" />
      </div>
    </AbsoluteFill>
  );
}
