import assert from "node:assert/strict";
import test from "node:test";
import { cardSpeechText, chooseSpeechVoice, speechVoiceKey } from "../features/cards/speech-settings.ts";

const joana = { name: "Joana", lang: "pt-PT", voiceURI: "joana" };
const other = { name: "Outro", lang: "pt_PT", voiceURI: "other" };
const english = { name: "Daniel", lang: "en-GB", voiceURI: "daniel" };

test("Portugal defaults to Joana regardless of voice list order", () => {
  assert.equal(chooseSpeechVoice([english, other, joana], "pt-PT", ""), joana);
});

test("explicit voice choice wins over the Joana default", () => {
  assert.equal(chooseSpeechVoice([other, joana], "pt-pt", speechVoiceKey(other)), other);
});

test("a missing language or stored voice never silently falls back", () => {
  assert.equal(chooseSpeechVoice([english], "pt-PT", ""), undefined);
  assert.equal(chooseSpeechVoice([other], "pt-PT", speechVoiceKey(joana)), undefined);
  assert.equal(chooseSpeechVoice([english, joana], "pt-PT", speechVoiceKey(english)), undefined);
});

test("another language is used only when explicitly selected", () => {
  assert.equal(chooseSpeechVoice([joana, english], "en-gb", ""), english);
});

test("Portuguese includes Brazilian voices only through explicit voice selection", () => {
  const brazilian = { name: "Luciana", lang: "pt-BR", voiceURI: "luciana" };
  assert.equal(chooseSpeechVoice([brazilian, joana], "pt", ""), joana);
  assert.equal(chooseSpeechVoice([brazilian, joana], "pt", speechVoiceKey(brazilian)), brazilian);
  assert.equal(chooseSpeechVoice([brazilian], "pt", ""), undefined);
});

test("WebKit explicitly marks the spoken language and escapes study text", () => {
  const result = cardSpeechText('a < b & "c"', "pt-PT", "AppleWebKit/605.1.15 Safari/605.1.15");
  assert(result.includes('<lang xml:lang="pt-PT">'));
  assert(result.includes("a &lt; b &amp; &quot;c&quot;"));
});

test("Chromium and Firefox never receive spoken XML markup", () => {
  for (const userAgent of ["AppleWebKit/537.36 Chrome/140", "Firefox/140"]) {
    assert.equal(cardSpeechText("eleger", "pt-PT", userAgent), "eleger");
  }
});
