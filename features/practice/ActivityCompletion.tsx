"use client";
import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useProfileLearning } from "./profile-learning";
import { recordActivity, type ActivityResult } from "./learning-rewards";
import styles from "./ChildProfile.module.css";
import {TempoCharacter} from "./TempoCharacter";

export const ChildPresentation = createContext(false);
export function useChildPresentation() { const presentation = useContext(ChildPresentation); return useProfileLearning()?.profile.child ?? presentation; }

export function ActivityCompletion({ id, title, group, correct, total, children, child, record = true, scoreLabel = "Самостоятельно" }: ActivityResult & { id: string; children?: ReactNode; child?: boolean; record?: boolean; scoreLabel?: string }) {
  const learner = useProfileLearning();
  const presentation = useChildPresentation();
  const isChild = child ?? presentation;
  const attempted = useRef<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!record || !learner || total < 1 || attempted.current === id) return;
    attempted.current = id;
    learner.update(current => recordActivity(current, id, { title, group, correct, total }));
  }, [record, learner, id, title, group, correct, total]);
  useEffect(() => {
    if (!isChild) return;
    heading.current?.focus({preventScroll:true});
    heading.current?.closest("section")?.scrollIntoView?.({block:"start"});
  }, [isChild, id]);
  if (!isChild) return <>{children}</>;
  const saved = !!learner?.learning.activities?.[id];
  return <section className={styles.result} aria-label="Результат занятия" data-tone={correct === total ? "sky" : "berry"}>
    <div className={styles.characterResult}><TempoCharacter pose={correct===total?"celebrate":"encourage"}/></div>
    <span className={styles.kicker}>{group} · ещё один шаг</span>
    <h2 ref={heading} tabIndex={-1}>{correct === total ? "Вот это получилось!" : "Занятие пройдено!"}</h2>
    <p className={styles.resultTitle}>{title}</p>
    <div className={styles.score}><span>{scoreLabel}</span><strong>{correct}<small> / {total}</small></strong></div>
    <p>{correct === total ? "Все задания этого круга получились. Можно продолжить или повторить любимое." : "Ты дошёл до конца. Сложные места можно повторить — уже полученные награды останутся."}</p>
    <p className={styles.note} role="status">{!learner ? "Пробное занятие: для постоянного альбома нужен локальный профиль." : learner.savingError || !saved ? "Результат ещё не сохранён. Нажми «Сохранить результаты ещё раз» выше." : "Значок в твоём альбоме! Повторное прохождение улучшает результат, а не добавляет копию."}</p>
    {learner?.openAlbum && <div className={styles.actions}><button type="button" onClick={learner.openAlbum}>В альбом наград →</button></div>}
    <div className={styles.legacyActions}>{children}</div>
  </section>;
}
