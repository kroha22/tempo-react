import { allVerbKeys, verbs, type PersonKey, type Tense, type VerbGroup, type VerbKey } from "./data.ts";

export type ConjugationQuery = {
  verb: VerbKey;
  tense: Tense;
  person: PersonKey;
};

export function resolveConjugation({ verb, tense, person }: ConjugationQuery): string {
  return verbs[verb].forms[tense][person];
}

export function resolveParadigm(verb: VerbKey, tense: Tense) {
  return verbs[verb].forms[tense];
}

export function verbKeysForGroup(group: VerbGroup): VerbKey[] {
  return allVerbKeys.filter((key) => verbs[key].group === group);
}

export function endingFor(verb: VerbKey, tense: Tense, person: PersonKey): string | null {
  const entry = verbs[verb];
  if (entry.group === "irregular") return null;
  return resolveConjugation({ verb, tense, person }).slice(entry.infinitive.slice(0, -2).length);
}
