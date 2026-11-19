"use client";
import { VocabularyStudy } from "./VocabularyStudy";
import styles from "./VocabularyHub.module.css";
import {useProfileLearning} from "./profile-learning";

export function VocabularyHub({ onOpenCards,initialChildMode=false,initialTopicId,onOpenPlan,planLabel="Мой план" }: { onOpenCards: () => void;initialChildMode?:boolean;initialTopicId?:string|null;onOpenPlan?:()=>void;planLabel?:string }) {
  const adult=useProfileLearning()?.profile.child===false;
  return (
    <main className={styles.shell} aria-label="Уроки">
      <header className={styles.header} data-ui-surface>
        <div>
          {!adult&&<span>Aprender · Учимся</span>}
          <h1 lang={adult?"ru":"pt-PT"}>{adult?"Каталог тем":"Aulas — Уроки"}</h1>
          {!adult&&<p>Темы, фразы, времена и формы — в одном месте.</p>}
        </div>
        {!adult&&<div><button type="button" onClick={onOpenCards}>Перейти к карточкам</button>{onOpenPlan&&<button type="button" onClick={onOpenPlan}>{planLabel}</button>}</div>}
      </header>
      <VocabularyStudy initialChildMode={initialChildMode} initialTopicId={initialTopicId} onOpenCards={onOpenCards} />
    </main>
  );
}
