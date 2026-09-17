/**
 * Synthesized "meow" with the Web Audio API: a buzzy tone whose pitch rises
 * then falls, shaped by two moving vowel filters ("mee-ow").
 */

let ctx: AudioContext | null = null;

export function meow() {
  const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  ctx ??= new AudioCtx();
  void ctx.resume();

  const t = ctx.currentTime;
  const len = 0.62 + Math.random() * 0.2;
  const pitch = 520 + Math.random() * 160; // every meow is a little different

  const out = ctx.createGain();
  out.gain.value = 0.22;
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 3800;
  lowpass.connect(out).connect(ctx.destination);

  // Voice: rising then falling pitch with a little vibrato.
  const voice = ctx.createOscillator();
  voice.type = 'sawtooth';
  voice.frequency.setValueAtTime(pitch * 0.85, t);
  voice.frequency.linearRampToValueAtTime(pitch * 1.45, t + len * 0.3);
  voice.frequency.linearRampToValueAtTime(pitch * 1.15, t + len * 0.65);
  voice.frequency.linearRampToValueAtTime(pitch * 0.75, t + len);
  const vibrato = ctx.createOscillator();
  vibrato.frequency.value = 7;
  const vibratoDepth = ctx.createGain();
  vibratoDepth.gain.value = pitch * 0.02;
  vibrato.connect(vibratoDepth).connect(voice.frequency);

  // Vowel formants: "m" (closed) -> "ee" -> "ow".
  const envelope = ctx.createGain();
  envelope.gain.setValueAtTime(0, t);
  envelope.gain.linearRampToValueAtTime(1, t + 0.07);
  envelope.gain.setValueAtTime(1, t + len * 0.55);
  envelope.gain.exponentialRampToValueAtTime(0.001, t + len);
  envelope.connect(lowpass);

  const formant = (q: number, gain: number, points: [number, number][]) => {
    const f = ctx!.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = q;
    f.frequency.setValueAtTime(points[0][1], t);
    for (const [at, hz] of points.slice(1)) f.frequency.linearRampToValueAtTime(hz, t + len * at);
    const g = ctx!.createGain();
    g.gain.value = gain;
    voice.connect(f).connect(g).connect(envelope);
  };
  formant(5, 1.6, [[0, 500], [0.25, 1000], [0.7, 750], [1, 550]]);
  formant(8, 1.1, [[0, 1500], [0.25, 2600], [0.7, 1100], [1, 900]]);

  voice.start(t);
  vibrato.start(t);
  voice.stop(t + len + 0.05);
  vibrato.stop(t + len + 0.05);
}
