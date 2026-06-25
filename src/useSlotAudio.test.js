import test from "node:test";
import assert from "node:assert/strict";

import { resolveAudioContextClass, startSamplePlayback } from "./useSlotAudio.js";

test("audio support resolver prefers standard AudioContext when available", () => {
  const StandardAudioContext = class {};
  const WebkitAudioContext = class {};

  assert.equal(
    resolveAudioContextClass({
      AudioContext: StandardAudioContext,
      webkitAudioContext: WebkitAudioContext,
    }),
    StandardAudioContext,
  );
});

test("audio support resolver falls back to webkitAudioContext", () => {
  const WebkitAudioContext = class {};

  assert.equal(
    resolveAudioContextClass({
      webkitAudioContext: WebkitAudioContext,
    }),
    WebkitAudioContext,
  );
});

test("audio support resolver returns null when audio context is unavailable", () => {
  assert.equal(resolveAudioContextClass({}), null);
});

test("sample playback calls play synchronously inside the user interaction", () => {
  const events = [];
  const audio = {
    currentTime: 0,
    duration: 2,
    play() {
      events.push("play");
      return Promise.resolve();
    },
    volume: 0,
  };

  const result = startSamplePlayback(
    audio,
    { offset: 0.62, volume: 0.5 },
    { isMuted: false, masterVolume: 0.6 },
  );

  events.push("returned");

  assert.deepEqual(events, ["play", "returned"]);
  assert.equal(audio.currentTime, 0.62);
  assert.equal(audio.volume, 0.3);
  assert.equal(typeof result?.catch, "function");
});
