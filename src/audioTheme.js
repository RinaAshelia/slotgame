export const AUDIO_STORAGE_KEY = "loewe-slots-audio";

export function buildAudioAssetUrl(pathname, baseUrl = import.meta.env?.BASE_URL ?? "/") {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;

  return `${normalizedBase}${normalizedPath}`;
}

export const AUDIO_CUES = {
  uiClick: {
    kind: "one-shot",
    volume: 0.14,
    steps: [
      { wave: "triangle", frequency: 640, duration: 0.04, gain: 1 },
      { wave: "sine", frequency: 880, duration: 0.03, gain: 0.55, delay: 0.018 },
    ],
  },
  spinStart: {
    kind: "one-shot",
    volume: 0.22,
    steps: [
      { wave: "triangle", frequency: 240, duration: 0.08, gain: 1 },
      { wave: "sine", frequency: 420, duration: 0.09, gain: 0.4, delay: 0.03 },
    ],
  },
  spinLoop: {
    kind: "loop",
    volume: 0.12,
    intervalMs: 140,
    steps: [
      { wave: "triangle", frequency: 176, duration: 0.09, gain: 0.82 },
      { wave: "sine", frequency: 352, duration: 0.07, gain: 0.24, delay: 0.018 },
      { wave: "square", frequency: 704, duration: 0.032, gain: 0.08, delay: 0.052 },
    ],
  },
  reelStop: {
    kind: "one-shot",
    volume: 0.18,
    steps: [
      { wave: "square", frequency: 520, duration: 0.03, gain: 0.6 },
      { wave: "triangle", frequency: 280, duration: 0.05, gain: 0.3, delay: 0.01 },
    ],
  },
  win: {
    kind: "one-shot",
    volume: 0.24,
    steps: [
      { wave: "sine", frequency: 660, duration: 0.1, gain: 0.7 },
      { wave: "triangle", frequency: 880, duration: 0.14, gain: 0.55, delay: 0.05 },
      { wave: "sine", frequency: 1100, duration: 0.12, gain: 0.3, delay: 0.11 },
    ],
  },
  featureTrigger: {
    kind: "one-shot",
    volume: 0.28,
    steps: [
      { wave: "triangle", frequency: 220, duration: 0.1, gain: 0.95 },
      { wave: "sine", frequency: 330, duration: 0.18, gain: 0.52, delay: 0.04 },
      { wave: "triangle", frequency: 494, duration: 0.18, gain: 0.42, delay: 0.12 },
    ],
  },
  sheepSelect: {
    kind: "sample",
    src: buildAudioAssetUrl("audio/sheep-feature.mp3"),
    offset: 0,
    playDuration: 0.72,
    volume: 0.28,
  },
  lionSelect: {
    kind: "sample",
    src: buildAudioAssetUrl("audio/lion-feature.mp3"),
    offset: 0.62,
    playDuration: 1.55,
    volume: 0.52,
  },
  riskWin: {
    kind: "one-shot",
    volume: 0.32,
    steps: [
      { wave: "triangle", frequency: 440, duration: 0.12, gain: 0.85 },
      { wave: "sine", frequency: 659.25, duration: 0.18, gain: 0.58, delay: 0.05 },
      { wave: "triangle", frequency: 987.77, duration: 0.22, gain: 0.44, delay: 0.13 },
    ],
  },
  riskLoss: {
    kind: "one-shot",
    volume: 0.22,
    steps: [
      { wave: "triangle", frequency: 392, duration: 0.09, gain: 0.6 },
      { wave: "sine", frequency: 261.63, duration: 0.13, gain: 0.48, delay: 0.04 },
      { wave: "triangle", frequency: 174.61, duration: 0.17, gain: 0.34, delay: 0.1 },
    ],
  },
  jackpot: {
    kind: "one-shot",
    volume: 0.4,
    steps: [
      { wave: "triangle", frequency: 392, duration: 0.14, gain: 0.95 },
      { wave: "sine", frequency: 523.25, duration: 0.18, gain: 0.72, delay: 0.04 },
      { wave: "triangle", frequency: 783.99, duration: 0.24, gain: 0.55, delay: 0.12 },
      { wave: "sine", frequency: 1046.5, duration: 0.32, gain: 0.36, delay: 0.22 },
    ],
  },
};

export function getDefaultAudioPreferences() {
  return {
    isMuted: false,
    masterVolume: 0.58,
  };
}

export function getCueNamesForOutcome(eventName) {
  const cueMap = {
    "spin-start": ["spinStart", "spinLoop"],
    "feature-open": ["featureTrigger"],
    "feature-safe": ["sheepSelect"],
    "feature-commit": ["lionSelect"],
    "feature-win": ["riskWin"],
    "feature-loss": ["sheepSelect", "riskLoss"],
    jackpot: ["jackpot"],
  };

  return cueMap[eventName] ?? [];
}

export function getCueNameForRiskDecision(takeSafe) {
  return takeSafe ? "sheepSelect" : null;
}

export function getCueNamesForRiskResult(resultOutcome) {
  const cueMap = {
    safe: ["sheepSelect"],
    "lion-win": ["lionSelect", "riskWin"],
    "lion-loss": ["sheepSelect"],
  };

  return cueMap[resultOutcome] ?? [];
}
