import { Composition, registerRoot } from 'remotion';
import { AgentLoop, AGENT_LOOP_DURATION, AGENT_LOOP_FPS, WIDE_W, WIDE_H } from './AgentLoop';
import { OgImage, OG_W, OG_H } from './OgImage';

// Remotion entry for the Studio and CLI renders. The website itself only imports AgentLoop via LoopPlayer.
export function Root() {
  return (
    <>
      <Composition id="AgentLoop" component={AgentLoop} durationInFrames={AGENT_LOOP_DURATION} fps={AGENT_LOOP_FPS} width={WIDE_W} height={WIDE_H} defaultProps={{ layout: 'wide' }} />
      <Composition id="OgImage" component={OgImage} durationInFrames={AGENT_LOOP_DURATION} fps={AGENT_LOOP_FPS} width={OG_W} height={OG_H} />
    </>
  );
}

registerRoot(Root);
