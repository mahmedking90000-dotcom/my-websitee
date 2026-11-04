"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

type AmbientAudio = {
  context: AudioContext;
  master: GainNode;
  pads: OscillatorNode[];
  timer: number;
  chordTimer: number;
};

const CHORDS = [
  [130.81, 164.81, 196, 261.63], // Cmaj7
  [110, 146.83, 174.61, 220], // Am7
  [87.31, 130.81, 164.81, 196], // Fmaj7
  [98, 146.83, 174.61, 220] // G6
];
const MELODY = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 783.99, 698.46, 587.33, 523.25];

function makeReverb(context: AudioContext) {
  const convolver = context.createConvolver();
  const length = Math.floor(context.sampleRate * 2.8);
  const impulse = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3.2);
    }
  }
  convolver.buffer = impulse;
  return convolver;
}

export default function AmbientControl() {
  const [enabled, setEnabled] = useState(false);
  const audioRef = useRef<AmbientAudio | null>(null);

  useEffect(() => () => {
    const audio = audioRef.current;
    if (!audio) return;
    window.clearInterval(audio.timer);
    window.clearInterval(audio.chordTimer);
    audio.pads.forEach((oscillator) => {
      try { oscillator.stop(); } catch { /* already stopped */ }
    });
    void audio.context.close();
  }, []);

  async function toggleAmbient() {
    const active = audioRef.current;
    if (active) {
      window.clearInterval(active.timer);
      window.clearInterval(active.chordTimer);
      active.master.gain.cancelScheduledValues(active.context.currentTime);
      active.master.gain.setTargetAtTime(0, active.context.currentTime, 0.5);
      active.pads.forEach((oscillator) => {
        try { oscillator.stop(active.context.currentTime + 1.6); } catch { /* already stopped */ }
      });
      audioRef.current = null;
      setEnabled(false);
      window.setTimeout(() => void active.context.close(), 1800);
      return;
    }

    const context = new AudioContext();
    await context.resume();

    const master = context.createGain();
    master.gain.value = 0.105;
    master.connect(context.destination);

    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1250;
    filter.Q.value = 0.35;
    filter.connect(master);

    const reverb = makeReverb(context);
    const wet = context.createGain();
    wet.gain.value = 0.22;
    reverb.connect(wet);
    wet.connect(master);

    const pads: OscillatorNode[] = [];
    const padLevels: GainNode[] = [];
    const addPad = (frequency: number, index: number) => {
      const oscillator = context.createOscillator();
      const level = context.createGain();
      oscillator.type = index === 1 ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      level.gain.value = 0.0001;
      oscillator.connect(level);
      level.connect(filter);
      level.connect(reverb);
      oscillator.start();
      level.gain.setTargetAtTime(0.025, context.currentTime, 2.2);
      pads.push(oscillator);
      padLevels.push(level);
    };

    CHORDS[0].forEach(addPad);
    let chordIndex = 0;
    const chordTimer = window.setInterval(() => {
      chordIndex = (chordIndex + 1) % CHORDS.length;
      CHORDS[chordIndex].forEach((frequency, index) => {
        const oscillator = pads[index];
        oscillator.frequency.cancelScheduledValues(context.currentTime);
        oscillator.frequency.setTargetAtTime(frequency, context.currentTime, 1.8);
      });
    }, 9000);

    let noteIndex = 0;
    const playNote = () => {
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = MELODY[noteIndex % MELODY.length];
      noteIndex += 1;
      envelope.gain.setValueAtTime(0.0001, context.currentTime);
      envelope.gain.exponentialRampToValueAtTime(0.055, context.currentTime + 0.65);
      envelope.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 4.2);
      oscillator.connect(envelope);
      envelope.connect(filter);
      envelope.connect(reverb);
      oscillator.start();
      oscillator.stop(context.currentTime + 4.3);
    };

    playNote();
    const timer = window.setInterval(playNote, 3900);
    audioRef.current = { context, master, pads, timer, chordTimer };
    setEnabled(true);
  }

  return (
    <button
      type="button"
      className="nova-ambient-toggle"
      onClick={() => void toggleAmbient()}
      aria-pressed={enabled}
      aria-label={enabled ? "إيقاف الموسيقى الهادئة" : "تشغيل اللحن الهادئ"}
      title={enabled ? "إيقاف الموسيقى الهادئة" : "تشغيل اللحن الهادئ"}
    >
      {enabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
      <span>{enabled ? "إيقاف الموسيقى" : "لحن هادئ"}</span>
    </button>
  );
}
