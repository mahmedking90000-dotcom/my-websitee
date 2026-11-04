"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

type AmbientAudio = {
  context: AudioContext;
  master: GainNode;
  filter: BiquadFilterNode;
  pads: OscillatorNode[];
  timer: number;
};

export default function AmbientControl() {
  const [enabled, setEnabled] = useState(false);
  const audioRef = useRef<AmbientAudio | null>(null);

  useEffect(() => () => {
    const audio = audioRef.current;
    if (!audio) return;
    window.clearInterval(audio.timer);
    audio.pads.forEach((oscillator) => {
      try { oscillator.stop(); } catch { /* already stopped */ }
    });
    void audio.context.close();
  }, []);

  async function toggleAmbient() {
    const active = audioRef.current;
    if (active) {
      window.clearInterval(active.timer);
      active.master.gain.cancelScheduledValues(active.context.currentTime);
      active.master.gain.setTargetAtTime(0, active.context.currentTime, 0.35);
      active.pads.forEach((oscillator) => {
        try { oscillator.stop(active.context.currentTime + 1.1); } catch { /* already stopped */ }
      });
      audioRef.current = null;
      setEnabled(false);
      window.setTimeout(() => void active.context.close(), 1250);
      return;
    }

    const context = new AudioContext();
    await context.resume();
    const master = context.createGain();
    master.gain.value = 0.18;
    master.connect(context.destination);

    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 950;
    filter.Q.value = 0.35;
    filter.connect(master);

    const pads: OscillatorNode[] = [];
    [130.81, 164.81, 196].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const level = context.createGain();
      oscillator.type = index === 1 ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      level.gain.value = 0.055;
      oscillator.connect(level);
      level.connect(filter);
      oscillator.start();
      pads.push(oscillator);
    });

    const melody = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 392, 349.23];
    let noteIndex = 0;
    const playNote = () => {
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = melody[noteIndex % melody.length];
      noteIndex += 1;
      envelope.gain.setValueAtTime(0.0001, context.currentTime);
      envelope.gain.exponentialRampToValueAtTime(0.075, context.currentTime + 0.45);
      envelope.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 2.8);
      oscillator.connect(envelope);
      envelope.connect(filter);
      oscillator.start();
      oscillator.stop(context.currentTime + 2.9);
    };

    playNote();
    const timer = window.setInterval(playNote, 3200);
    audioRef.current = { context, master, filter, pads, timer };
    setEnabled(true);
  }

  return (
    <button
      type="button"
      className="nova-ambient-toggle"
      onClick={() => void toggleAmbient()}
      aria-pressed={enabled}
      aria-label={enabled ? "إيقاف الأجواء الموسيقية" : "تشغيل أجواء موسيقية هادئة"}
      title={enabled ? "إيقاف الموسيقى الهادئة" : "تشغيل موسيقى هادئة"}
    >
      {enabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
      <span>{enabled ? "إيقاف الأجواء" : "موسيقى هادئة"}</span>
    </button>
  );
}
