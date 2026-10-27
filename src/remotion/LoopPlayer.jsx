import { useEffect, useState } from 'react';
import { Player } from '@remotion/player';
import { AgentLoop, AGENT_LOOP_DURATION, AGENT_LOOP_FPS, WIDE_W, WIDE_H, TALL_W, TALL_H } from './AgentLoop';

const NARROW = '(max-width: 640px)';

// Loaded lazily from App.jsx so Remotion stays out of the first-paint bundle.
export default function LoopPlayer({ reducedMotion }) {
  const [layout, setLayout] = useState(() => (window.matchMedia(NARROW).matches ? 'tall' : 'wide'));

  useEffect(() => {
    const mq = window.matchMedia(NARROW);
    const onChange = () => setLayout(mq.matches ? 'tall' : 'wide');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const [width, height] = layout === 'tall' ? [TALL_W, TALL_H] : [WIDE_W, WIDE_H];
  return (
    <Player
      key={layout}
      component={AgentLoop}
      inputProps={{ layout }}
      durationInFrames={AGENT_LOOP_DURATION}
      fps={AGENT_LOOP_FPS}
      compositionWidth={width}
      compositionHeight={height}
      autoPlay={!reducedMotion}
      initialFrame={reducedMotion ? AGENT_LOOP_DURATION - 1 : 0}
      loop
      controls={false}
      clickToPlay={false}
      style={{ width: '100%', aspectRatio: `${width} / ${height}` }}
    />
  );
}
