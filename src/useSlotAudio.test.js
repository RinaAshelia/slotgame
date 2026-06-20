import test from "node:test";
import assert from "node:assert/strict";

import { resolveAudioContextClass } from "./useSlotAudio.js";

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
