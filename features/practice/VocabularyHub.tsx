"use client";
import { VocabularyStudy } from "./VocabularyStudy";
import styles from "./VocabularyHub.module.css";

export function VocabularyHub({ onOpenCards,initialChildMode=false,initialTopicId,onOpenPlan,planLabel="Мой план" }: { onOpenCards: () => void;initialChildMode?:boolean;initialTopicId?:string|null;onOpenPlan?:()=>void;planLabel?:string }) {
  return (
    <main className={styles.shell} aria-label="Уроки">
      <header className={styles.header}>
        <div>
          <span>Aprender · Учимся</span>
          <h1 lang="pt-PT">Aulas — Уроки</h1>
          <p>Темы, фразы, времена и формы — в одном месте.</p>
        </div>
        <div><button type="button" onClick={onOpenCards}>Перейти к карточкам</button>{onOpenPlan&&<button type="button" onClick={onOpenPlan}>{planLabel}</button>}</div>
      </header>
      <VocabularyStudy initialChildMode={initialChildMode} initialTopicId={initialTopicId} onOpenCards={onOpenCards} />
    </main>
  );
}
