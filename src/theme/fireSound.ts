/**
 * Synthesized campfire: a low, breathing roar of filtered noise plus random
 * crackles and the odd louder pop, all made with the Web Audio API.
 */

export interface FireSound {
  stop: () => void;
}

function noiseBuffer(ctx: AudioContext, seconds: number, brown: boolean) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else {
      data[i] = white;
    }
  }
  return buffer;
}

export function startFireSound(): FireSound | null {
  const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  const ctx = new AudioCtx();
  void ctx.resume();

  const master = ctx.createGain();
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 1.5); // fade in
  master.connect(ctx.destination);

  // Roar: looping brown noise, low-passed, gently breathing.
  const roar = ctx.createBufferSource();
  roar.buffer = noiseBuffer(ctx, 4, true);
  roar.loop = true;
  const roarFilter = ctx.createBiquadFilter();
  roarFilter.type = 'lowpass';
  roarFilter.frequency.value = 420;
  const roarGain = ctx.createGain();
  roarGain.gain.value = 0.22;
  const breath = ctx.createOscillator();
  breath.frequency.value = 0.18;
  const breathDepth = ctx.createGain();
  breathDepth.gain.value = 0.08;
  breath.connect(breathDepth).connect(roarGain.gain);
  roar.connect(roarFilter).connect(roarGain).connect(master);
  roar.start();
  breath.start();

  const crackleNoise = noiseBuffer(ctx, 1, false);

  const crackle = (when: number, loud: boolean) => {
    const src = ctx.createBufferSource();
    src.buffer = crackleNoise;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = loud ? 900 + Math.random() * 1200 : 1800 + Math.random() * 4200;
    filter.Q.value = loud ? 1.2 : 3 + Math.random() * 6;
    const env = ctx.createGain();
    const peak = loud ? 0.5 + Math.random() * 0.4 : 0.05 + Math.random() * 0.25;
    const length = loud ? 0.03 + Math.random() * 0.05 : 0.004 + Math.random() * 0.018;
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(peak, when + 0.001);
    env.gain.exponentialRampToValueAtTime(0.0001, when + length);
    src.connect(filter).connect(env).connect(master);
    src.start(when, Math.random() * 0.9, length + 0.02);
  };

  // Schedule crackles slightly ahead of the audio clock.
  let next = ctx.currentTime + 0.1;
  const timer = window.setInterval(() => {
    while (next < ctx.currentTime + 0.3) {
      // Crackles come in little bursts.
      const burst = Math.random() < 0.25 ? 2 + Math.floor(Math.random() * 5) : 1;
      for (let i = 0; i < burst; i++) crackle(next + i * (0.01 + Math.random() * 0.04), false);
      if (Math.random() < 0.04) crackle(next + 0.02, true);
      next += 0.04 + Math.random() * 0.25;
    }
  }, 100);

  return {
    stop() {
      window.clearInterval(timer);
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0, t + 0.6);
      window.setTimeout(() => void ctx.close(), 700);
    },
  };
}
