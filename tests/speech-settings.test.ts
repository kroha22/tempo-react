import assert from "node:assert/strict";
import test from "node:test";
import { chooseSpeechVoice, migrateSpeechSettings, speechLocale, speechVoiceKey } from "../features/cards/speech-settings.ts";

const joana = { name: "Joana", lang: "pt-PT", voiceURI: "joana" };
const other = { name: "Outro", lang: "pt_PT", voiceURI: "other" };
const english = { name: "Daniel", lang: "en-GB", voiceURI: "daniel" };

test("speech locales normalize platform underscores and region casing", () => {
  assert.equal(speechLocale("pt_PT"), "pt-PT");
  assert.equal(speechLocale("pt-br"), "pt-BR");
  assert.equal(speechLocale("sv-se"), "sv-SE");
});

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

test("Portuguese regions and French use exactly the same locale filtering", () => {
  const brazilian = { name: "Luciana", lang: "pt-BR", voiceURI: "luciana" };
  const french = { name: "Thomas", lang: "fr-FR", voiceURI: "thomas" };
  const voices = [brazilian, french, joana];
  for (const voice of voices) {
    assert.equal(chooseSpeechVoice(voices, voice.lang, speechVoiceKey(voice)), voice);
    assert.equal(chooseSpeechVoice(voices.filter((candidate) => candidate !== voice), voice.lang, ""), undefined);
  }
  assert.equal(chooseSpeechVoice(voices, "pt", ""), undefined);
});

test("legacy grouped preferences retain the user's selected regional voice", () => {
  const voice = "pt-br|grandpa|Grandpa";
  assert.deepEqual(JSON.parse(migrateSpeechSettings(JSON.stringify({ language: "pt", voice }))), { language: "pt-BR", voice });
  assert.deepEqual(JSON.parse(migrateSpeechSettings('{"language":"pt","voice":""}')), { language: "pt-PT", voice: "" });
});
