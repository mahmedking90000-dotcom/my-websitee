"use client";

import { useEffect, useRef } from "react";

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };
type SoundKind = "tap" | "open" | "close";

function getSoundKind(control: Element): SoundKind {
  const explicit = control.getAttribute("data-sound");
  if (explicit === "open" || explicit === "close" || explicit === "tap") return explicit;

  const label = [
    control.getAttribute("aria-label"),
    control.getAttribute("title"),
    control.textContent
  ].filter(Boolean).join(" ").toLowerCase();

  if (/close|dismiss|back|رجوع|إغلاق|اغلاق|قفل|إلغاء|الغاء/.test(label)) return "close";
  if (/open|create|new project|إنشاء|مشروع جديد|فتح|عرض|دخول|التالي/.test(label)) return "open";
  return "tap";
}

export default function InteractionSounds() {
  const contextRef = useRef<AudioContext | null>(null);
  const lastPlayedRef = useRef(0);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const control = target.closest(
        'button, a, input, textarea, select, summary, [role], [tabindex], [data-click-sound], [data-sound]'
      ) || target.closest("svg");
      if (!control) return;
      if (
        (control instanceof HTMLButtonElement && control.disabled) ||
        (control instanceof HTMLInputElement && (control.disabled || control.type === "file"))
      ) return;

      const now = performance.now();
      if (now - lastPlayedRef.current < 55) return;
      lastPlayedRef.current = now;

      try {
        const audioWindow = window as AudioWindow;
        const AudioContextClass = window.AudioContext || audioWindow.webkitAudioContext;
        if (!AudioContextClass) return;

        if (!contextRef.current || contextRef.current.state === "closed") {
          contextRef.current = new AudioContextClass();
        }
        const context = contextRef.current;
        if (context.state === "suspended") void context.resume();

        const kind = getSoundKind(control);
        const master = context.createGain();
        const start = context.currentTime;
        const duration = kind === "open" ? 0.19 : kind === "close" ? 0.16 : 0.105;
        const peak = kind === "tap" ? 0.035 : 0.028;

        master.gain.setValueAtTime(0.0001, start);
        master.gain.exponentialRampToValueAtTime(peak, start + 0.008);
        master.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        master.connect(context.destination);

        const notes = kind === "open"
          ? [{ hz: 660, at: 0 }, { hz: 880, at: 0.045 }, { hz: 1174.66, at: 0.09 }]
          : kind === "close"
            ? [{ hz: 880, at: 0 }, { hz: 659.25, at: 0.055 }]
            : [{ hz: 1046.5, at: 0 }, { hz: 784, at: 0.012 }];

        notes.forEach(({ hz, at }, index) => {
          const oscillator = context.createOscillator();
          const envelope = context.createGain();
          const noteStart = start + at;
          const noteEnd = Math.min(start + duration, noteStart + (kind === "tap" ? 0.085 : 0.12));
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(hz, noteStart);
          oscillator.frequency.exponentialRampToValueAtTime(hz * (kind === "close" ? 0.88 : 0.94), noteEnd);
          envelope.gain.setValueAtTime(index === 0 ? 0.8 : 0.48, noteStart);
          envelope.gain.exponentialRampToValueAtTime(0.0001, noteEnd);
          oscillator.connect(envelope);
          envelope.connect(master);
          oscillator.start(noteStart);
          oscillator.stop(noteEnd + 0.005);
          oscillator.onended = () => {
            oscillator.disconnect();
            envelope.disconnect();
            if (index === notes.length - 1) master.disconnect();
          };
        });
      } catch {
        // Audio feedback must never interrupt the action.
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      if (contextRef.current && contextRef.current.state !== "closed") {
        void contextRef.current.close();
      }
      contextRef.current = null;
    };
  }, []);

  return null;
}
