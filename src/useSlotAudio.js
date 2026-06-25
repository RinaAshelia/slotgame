import { useEffect, useRef, useState } from "react";

import { AUDIO_CUES, AUDIO_STORAGE_KEY, getDefaultAudioPreferences } from "./audioTheme.js";

export function resolveAudioContextClass(targetWindow) {
  if (!targetWindow) {
    return null;
  }

  return targetWindow.AudioContext ?? targetWindow.webkitAudioContext ?? null;
}

export function startSamplePlayback(audio, cue, preferences) {
  if (!audio || !cue) {
    return null;
  }

  audio.volume = preferences.isMuted ? 0 : preferences.masterVolume * cue.volume;

  if (typeof cue.offset === "number") {
    const maxStart = Number.isFinite(audio.duration) ? Math.max(audio.duration - 0.01, 0) : cue.offset;
    audio.currentTime = Math.min(cue.offset, maxStart);
  }

  return audio.play();
}

function readStoredPreferences() {
  if (typeof window === "undefined") {
    return getDefaultAudioPreferences();
  }

  const fallback = getDefaultAudioPreferences();

  try {
    const raw = window.localStorage.getItem(AUDIO_STORAGE_KEY);

    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);

    return {
      isMuted: typeof parsed.isMuted === "boolean" ? parsed.isMuted : fallback.isMuted,
      masterVolume:
        typeof parsed.masterVolume === "number" ? parsed.masterVolume : fallback.masterVolume,
    };
  } catch {
    return fallback;
  }
}

export function useSlotAudio() {
  const [preferences, setPreferences] = useState(() => readStoredPreferences());
  const audioContextRef = useRef(null);
  const masterGainRef = useRef(null);
  const loopTimersRef = useRef(new Map());
  const sampleElementCacheRef = useRef(new Map());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    if (!masterGainRef.current) {
      return;
    }

    const nextGain = preferences.isMuted ? 0.0001 : preferences.masterVolume;
    masterGainRef.current.gain.setTargetAtTime(
      nextGain,
      audioContextRef.current.currentTime,
      0.02,
    );
  }, [preferences]);

  useEffect(() => {
    return () => {
      for (const intervalId of loopTimersRef.current.values()) {
        window.clearInterval(intervalId);
      }

      loopTimersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const primeAudio = () => {
      void ensureAudioReady();
      primeSampleElements();
    };

    window.addEventListener("pointerdown", primeAudio, { once: true });
    window.addEventListener("keydown", primeAudio, { once: true });

    return () => {
      window.removeEventListener("pointerdown", primeAudio);
      window.removeEventListener("keydown", primeAudio);
    };
  }, []);

  async function ensureAudioReady() {
    if (typeof window === "undefined") {
      return null;
    }

    const AudioContextClass = resolveAudioContextClass(window);

    if (!AudioContextClass) {
      return null;
    }

    if (!audioContextRef.current) {
      const context = new AudioContextClass();
      const masterGain = context.createGain();
      masterGain.gain.value = preferences.isMuted ? 0.0001 : preferences.masterVolume;
      masterGain.connect(context.destination);
      audioContextRef.current = context;
      masterGainRef.current = masterGain;
    }

    if (audioContextRef.current.state === "suspended" || audioContextRef.current.state === "interrupted") {
      await audioContextRef.current.resume().catch(() => null);
    }

    return audioContextRef.current;
  }

  async function getSampleElement(cue) {
    if (typeof window === "undefined" || !cue?.src) {
      return null;
    }

    if (sampleElementCacheRef.current.has(cue.src)) {
      return sampleElementCacheRef.current.get(cue.src);
    }

    const audio = new window.Audio(cue.src);
    audio.preload = "auto";
    sampleElementCacheRef.current.set(cue.src, audio);

    if (audio.readyState >= 1) {
      return audio;
    }

    await new Promise((resolve) => {
      const handleReady = () => {
        audio.removeEventListener("loadedmetadata", handleReady);
        audio.removeEventListener("canplaythrough", handleReady);
        audio.removeEventListener("error", handleReady);
        resolve();
      };

      audio.addEventListener("loadedmetadata", handleReady);
      audio.addEventListener("canplaythrough", handleReady);
      audio.addEventListener("error", handleReady);
      audio.load();
    });

    return audio;
  }

  function primeSampleElements() {
    Object.values(AUDIO_CUES)
      .filter((cue) => cue.kind === "sample")
      .forEach((cue) => {
        void getSampleElement(cue);
      });
  }

  function playSampleCue(cueName) {
    const cue = AUDIO_CUES[cueName];

    if (!cue || cue.kind !== "sample" || typeof window === "undefined") {
      return;
    }

    const cachedAudio = sampleElementCacheRef.current.get(cue.src);
    const audio = cachedAudio?.cloneNode ? cachedAudio.cloneNode(true) : new window.Audio(cue.src);
    audio.preload = "auto";
    const playResult = startSamplePlayback(audio, cue, preferences);
    void playResult?.catch(() => null);

    if (typeof cue.playDuration === "number") {
      window.setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, cue.playDuration * 1000);
    }
  }

  function scheduleCue(cueName) {
    const context = audioContextRef.current;
    const masterGain = masterGainRef.current;
    const cue = AUDIO_CUES[cueName];

    if (!context || !masterGain || !cue) {
      return;
    }

    const startTime = context.currentTime + 0.01;

    cue.steps.forEach((step) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const stepStart = startTime + (step.delay ?? 0);
      const stepEnd = stepStart + step.duration;

      oscillator.type = step.wave;
      oscillator.frequency.setValueAtTime(step.frequency, stepStart);
      gainNode.gain.setValueAtTime(0.0001, stepStart);
      gainNode.gain.linearRampToValueAtTime(cue.volume * step.gain, stepStart + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, stepEnd);
      oscillator.connect(gainNode);
      gainNode.connect(masterGain);
      oscillator.start(stepStart);
      oscillator.stop(stepEnd + 0.02);
    });
  }

  async function playCue(cueName) {
    const cue = AUDIO_CUES[cueName];

    if (!cue) {
      return;
    }

    if (cue.kind === "sample") {
      playSampleCue(cueName);
      return;
    }

    const context = await ensureAudioReady();

    if (!context || cue.kind === "loop") {
      return;
    }

    scheduleCue(cueName);
  }

  async function startLoop(cueName) {
    const cue = AUDIO_CUES[cueName];

    if (!cue || cue.kind !== "loop" || loopTimersRef.current.has(cueName)) {
      return;
    }

    const context = await ensureAudioReady();

    if (!context) {
      return;
    }

    scheduleCue(cueName);

    const intervalId = window.setInterval(() => {
      scheduleCue(cueName);
    }, cue.intervalMs);

    loopTimersRef.current.set(cueName, intervalId);
  }

  function stopLoop(cueName) {
    const intervalId = loopTimersRef.current.get(cueName);

    if (!intervalId) {
      return;
    }

    window.clearInterval(intervalId);
    loopTimersRef.current.delete(cueName);
  }

  function stopAllLoops() {
    for (const cueName of loopTimersRef.current.keys()) {
      stopLoop(cueName);
    }
  }

  function toggleMute() {
    let nextPreferences = null;

    setPreferences((current) => {
      nextPreferences = { ...current, isMuted: !current.isMuted };
      return nextPreferences;
    });

    return nextPreferences;
  }

  return {
    isMuted: preferences.isMuted,
    playCue,
    startLoop,
    stopAllLoops,
    stopLoop,
    toggleMute,
  };
}
