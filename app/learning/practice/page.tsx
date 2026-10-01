import PracticeClient from "@/features/practice/PracticeScreen";
import { AppShell } from "@/features/app-shell/AppShell";
import { allVerbKeys, type Tense, type VerbKey } from "@/features/conjugation/data";
import type { ChildStep } from "@/features/practice/practice-types";
import { parsePresentationMode } from "@/features/learning/presentation-mode";
import Link from "next/link";

export default async function PracticePage({ searchParams }: { searchParams: Promise<{ mode?: string | string[]; verb?: string; tense?: string }> }) {
  const query = await searchParams;
  const presentationMode = parsePresentationMode(query.mode);
  const hasRequestedVerb = allVerbKeys.includes(query.verb as VerbKey);
  const verb = hasRequestedVerb ? query.verb as VerbKey : "fazer";
  const tense: Tense = query.tense === "past" ? "past" : "present";
  const initialChildStep: ChildStep = hasRequestedVerb ? "exercise" : "kingdom";
  return <AppShell current="learning"><section className="practice-intro"><span className="tempo-kicker">Практика · формы глаголов</span><h1>Потренируем спряжение</h1><p>Если вы пришли из урока, нужный глагол уже выбран. Можно выбрать другой и заниматься в удобном режиме.</p><Link href="/learning/conjugation">← Все глаголы</Link></section><div className="practice-legacy"><PracticeClient initialVerbKey={verb} initialTense={tense} initialChildMode={presentationMode === "kingdoms"} initialChildStep={initialChildStep} /></div></AppShell>;
}
