"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const MUSIC_URL = "https://assets.mixkit.co/music/preview/mixkit-pilates-and-yoga-419.mp3";

export default function AmbientControl() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
  }, []);

  async function toggleAmbient() {
    const audio = audioRef.current;
    if (!audio) return;

    if (enabled) {
      audio.pause();
      setEnabled(false);
      return;
    }

    try {
      setFailed(false);
      audio.volume = 0.14;
      await audio.play();
      setEnabled(true);
    } catch {
      setFailed(true);
      setEnabled(false);
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={MUSIC_URL}
        preload="none"
        loop
        onPause={() => setEnabled(false)}
        onPlay={() => setEnabled(true)}
        onError={() => {
          setFailed(true);
          setEnabled(false);
        }}
        aria-hidden="true"
      />
      <button
        type="button"
        className="nova-ambient-toggle"
        onClick={() => void toggleAmbient()}
        aria-pressed={enabled}
        aria-label={enabled ? "إيقاف الموسيقى الهادئة" : "تشغيل الموسيقى الهادئة"}
        title={enabled ? "إيقاف الموسيقى الهادئة" : "تشغيل الموسيقى الهادئة"}
      >
        {enabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
        <span>{failed ? "تعذّر تشغيل الموسيقى" : enabled ? "إيقاف الموسيقى" : "موسيقى هادئة"}</span>
      </button>
    </>
  );
}
