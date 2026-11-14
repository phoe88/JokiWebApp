/**
 * A small step sequencer on the Web Audio API that plays the playlist's original
 * tracks with no audio files. Each style has its own drum pattern, bass, chord
 * voicing and arpeggio. Notes are scheduled a little ahead on the audio clock, the
 * standard way to keep timing steady while the main thread is busy.
 */

const STEPS_PER_BAR = 16;
const TICK_MS = 25;

let sharedContext = null;
let noiseBuffer = null;

export const isAudioSupported = () =>
  typeof window !== 'undefined' && Boolean(window.AudioContext || window.webkitAudioContext);

function audioContext() {
  if (!sharedContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    sharedContext = new AudioContextClass();
  }
  return sharedContext;
}

function whiteNoise(ctx) {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const everyStep = Array.from({ length: STEPS_PER_BAR }, (_, i) => i);
const eighths = everyStep.filter((i) => i % 2 === 0);

const STYLES = {
  lofi: {
    cutoff: 1700,
    swing: 0.2,
    kick: [0, 7, 10],
    snare: [4, 12],
    hat: eighths,
    hatGain: 0.05,
    pad: { wave: 'triangle', gain: 0.055, attack: 0.06, release: 0.5, octave: 0 },
    bass: { wave: 'sine', gain: 0.32, steps: [0, 8, 11], octave: -12, length: 3 },
    arp: { wave: 'sine', gain: 0.045, steps: [2, 6, 9, 14], pattern: [3, 2, 1, 2], octave: 12, length: 2.5 },
    crackle: true,
  },
  synthwave: {
    cutoff: 3200,
    swing: 0,
    kick: [0, 4, 8, 12],
    snare: [4, 12],
    hat: [2, 6, 10, 14],
    hatGain: 0.06,
    pad: { wave: 'sawtooth', gain: 0.022, attack: 0.15, release: 0.4, octave: 0 },
    bass: { wave: 'sawtooth', gain: 0.12, steps: eighths, octave: -12, length: 1.6 },
    arp: { wave: 'square', gain: 0.03, steps: everyStep, pattern: [0, 1, 2, 3, 2, 1], octave: 12, length: 0.9 },
  },
  ambient: {
    cutoff: 1400,
    swing: 0,
    kick: [],
    snare: [],
    hat: [],
    pad: { wave: 'sine', gain: 0.07, attack: 1.2, release: 2.2, octave: 0 },
    bass: { wave: 'sine', gain: 0.18, steps: [0], octave: -12, length: 14 },
    arp: { wave: 'triangle', gain: 0.035, steps: [0, 6, 10], pattern: [2, 3, 1], octave: 24, length: 6 },
  },
  chiptune: {
    cutoff: 7000,
    swing: 0,
    kick: [0, 8],
    snare: [4, 12],
    hat: eighths,
    hatGain: 0.035,
    pad: null,
    bass: { wave: 'triangle', gain: 0.22, steps: [0, 4, 8, 12], octave: -12, length: 1.8 },
    arp: { wave: 'square', gain: 0.032, steps: everyStep, pattern: [0, 2, 4, 2, 1, 3, 5, 3], octave: 12, length: 0.8 },
  },
};

function tone(ctx, dest, { frequency, start, duration, wave, gain, attack = 0.01, release = 0.08 }) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(frequency, start);
  env.gain.setValueAtTime(0.0001, start);
  env.gain.linearRampToValueAtTime(gain, start + attack);
  env.gain.setValueAtTime(gain, start + Math.max(duration, attack));
  env.gain.exponentialRampToValueAtTime(0.0001, start + Math.max(duration, attack) + release);
  osc.connect(env).connect(dest);
  osc.start(start);
  osc.stop(start + Math.max(duration, attack) + release + 0.05);
}

function burst(ctx, dest, { start, filter, frequency, gain, decay }) {
  const source = ctx.createBufferSource();
  source.buffer = whiteNoise(ctx);
  const band = ctx.createBiquadFilter();
  band.type = filter;
  band.frequency.value = frequency;
  const env = ctx.createGain();
  env.gain.setValueAtTime(gain, start);
  env.gain.exponentialRampToValueAtTime(0.0001, start + decay);
  source.connect(band).connect(env).connect(dest);
  source.start(start, Math.random() * 0.5);
  source.stop(start + decay + 0.02);
}

function kick(ctx, dest, start) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.frequency.setValueAtTime(140, start);
  osc.frequency.exponentialRampToValueAtTime(42, start + 0.12);
  env.gain.setValueAtTime(0.55, start);
  env.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
  osc.connect(env).connect(dest);
  osc.start(start);
  osc.stop(start + 0.3);
}

/** A sequencer bound to the shared AudioContext. One instance plays one track at a time. */
export function createSynth() {
  let timer = null;
  let bus = null;
  let track = null;
  let step = 0;
  let nextTime = 0;

  const style = () => STYLES[track.synth.style] ?? STYLES.lofi;
  const stepLength = () => 60 / track.synth.bpm / 4;

  function scheduleStep(index, time) {
    const ctx = audioContext();
    const s = style();
    const { root, chords } = track.synth;
    const inBar = index % STEPS_PER_BAR;
    const chord = chords[Math.floor(index / STEPS_PER_BAR) % chords.length];
    const len = stepLength();
    const at = time + (inBar % 2 === 1 ? s.swing * len : 0);

    if (s.kick.includes(inBar)) kick(ctx, bus, at);
    if (s.snare.includes(inBar)) {
      burst(ctx, bus, { start: at, filter: 'bandpass', frequency: 1800, gain: 0.22, decay: 0.16 });
      tone(ctx, bus, { frequency: 190, start: at, duration: 0.02, wave: 'triangle', gain: 0.12, release: 0.08 });
    }
    if (s.hat.includes(inBar)) {
      burst(ctx, bus, { start: at, filter: 'highpass', frequency: 7500, gain: s.hatGain, decay: 0.045 });
    }
    if (s.crackle && Math.random() < 0.25) {
      burst(ctx, bus, { start: at + Math.random() * len, filter: 'highpass', frequency: 3000, gain: 0.012, decay: 0.01 });
    }

    if (s.pad && inBar === 0) {
      for (const note of chord) {
        tone(ctx, bus, {
          frequency: hz(root + s.pad.octave + note),
          start: at,
          duration: len * STEPS_PER_BAR * 0.9,
          wave: s.pad.wave,
          gain: s.pad.gain,
          attack: s.pad.attack,
          release: s.pad.release,
        });
      }
    }

    if (s.bass.steps.includes(inBar)) {
      tone(ctx, bus, {
        frequency: hz(root + s.bass.octave + chord[0]),
        start: at,
        duration: len * s.bass.length,
        wave: s.bass.wave,
        gain: s.bass.gain,
        release: 0.12,
      });
    }

    if (s.arp && s.arp.steps.includes(inBar)) {
      const notes = [...chord, ...chord.map((n) => n + 12)];
      const position = s.arp.steps.indexOf(inBar);
      const note = notes[s.arp.pattern[position % s.arp.pattern.length] % notes.length];
      tone(ctx, bus, {
        frequency: hz(root + s.arp.octave + note),
        start: at,
        duration: len * s.arp.length,
        wave: s.arp.wave,
        gain: s.arp.gain,
        release: track.synth.style === 'ambient' ? 1.5 : 0.1,
      });
    }
  }

  function tick() {
    const ctx = audioContext();
    // Background tabs throttle timers to about once a second, so look further ahead there.
    const ahead = document.hidden ? 1.5 : 0.12;
    while (nextTime < ctx.currentTime + ahead) {
      scheduleStep(step, nextTime);
      nextTime += stepLength();
      step += 1;
    }
  }

  /** Fades out what is playing and returns the bar it reached, to resume from later. */
  function stop() {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
    const reached = Math.floor(step / STEPS_PER_BAR) * STEPS_PER_BAR;
    if (bus) {
      const ctx = audioContext();
      const old = bus;
      old.gain.cancelScheduledValues(ctx.currentTime);
      old.gain.setValueAtTime(old.gain.value, ctx.currentTime);
      old.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
      window.setTimeout(() => old.disconnect(), 250);
      bus = null;
    }
    return reached;
  }

  /** Starts `nextTrack` from step `fromStep`, stopping anything this synth was playing. */
  async function start(nextTrack, fromStep = 0) {
    stop();
    const ctx = audioContext();
    if (ctx.state === 'suspended') await ctx.resume();

    track = nextTrack;
    step = fromStep;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = style().cutoff;
    const compressor = ctx.createDynamicsCompressor();
    bus = ctx.createGain();
    bus.gain.setValueAtTime(0, ctx.currentTime);
    bus.gain.linearRampToValueAtTime(0.85, ctx.currentTime + 0.12);
    // Every note connects to the bus, which feeds the filter, the compressor, then the speakers.
    bus.connect(filter).connect(compressor).connect(ctx.destination);

    nextTime = ctx.currentTime + 0.06;
    tick();
    timer = window.setInterval(tick, TICK_MS);
  }

  return { start, stop };
}
