"use client";

import { useEffect, useRef } from "react";

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

export default function InteractionSounds() {
  const contextRef = useRef<AudioContext | null>(null);
  const lastPlayedRef = useRef(0);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const control = target.closest(
        'button, a, input, textarea, select, summary, [role="button"], [role="tab"], [role="checkbox"], [role="switch"], [data-click-sound]'
      );
      if (!control || (control instanceof HTMLButtonElement && control.disabled)) return;

      const now = performance.now();
      if (now - lastPlayedRef.current < 65) return;
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

        const master = context.createGain();
        master.gain.setValueAtTime(0.0001, context.currentTime);
        master.gain.exponentialRampToValueAtTime(0.052, context.currentTime + 0.006);
        master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.105);
        master.connect(context.destination);

        // A tiny, soft two-tone glass "tick", inspired by native mobile UI feedback.
        const first = context.createOscillator();
        const second = context.createOscillator();
        first.type = "sine";
        second.type = "sine";
        first.frequency.setValueAtTime(880, context.currentTime);
        first.frequency.exponentialRampToValueAtTime(740, context.currentTime + 0.085);
        second.frequency.setValueAtTime(1320, context.currentTime);
        second.frequency.exponentialRampToValueAtTime(1110, context.currentTime + 0.07);

        const shimmer = context.createGain();
        shimmer.gain.value = 0.22;
        first.connect(master);
        second.connect(shimmer);
        shimmer.connect(master);
        first.start();
        second.start();
        first.stop(context.currentTime + 0.11);
        second.stop(context.currentTime + 0.09);
        first.onended = () => {
          master.disconnect();
          shimmer.disconnect();
        };
      } catch {
        // Audio feedback is an enhancement; it must never interrupt a page action.
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
