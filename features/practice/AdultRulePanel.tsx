import { people, type ConjugationVerb, type Forms, type Tense, type VerbGroup } from "@/features/conjugation/data";
import styles from "./AdultRulePanel.module.css";

type AdultRulePanelProps = {
  group: VerbGroup;
  tense: Tense;
  verb: ConjugationVerb;
  forms: Forms;
};

export function AdultRulePanel({ group, tense, verb, forms }: AdultRulePanelProps) {
  return (
    <details className={styles.adultRule}>
      <summary>
        <span className={styles.label}>Краткое правило</span>
        <strong>{tense === "present" ? "Обычно, регулярно или как факт" : "Завершённое действие в прошлом"}</strong>
        <span className={styles.markers}>{tense === "present" ? "normalmente · sempre · todos os dias" : "ontem · já · na semana passada"}</span>
        <span className={styles.open}>{group === "irregular" ? "Формы" : "Окончания"}<b aria-hidden="true">⌄</b></span>
      </summary>
      <div className={styles.endings}>
        <p>{group === "irregular" ? "У неправильных глаголов запоминаем форму целиком." : `Убираем -${group.toUpperCase()} и добавляем окончание:`}</p>
        <div>
          {people.map((person) => {
            const form = forms[person.key];
            const stem = verb.infinitive.slice(0, -2);
            return <span key={person.key}><b>{person.label}</b><strong>{group === "irregular" ? form : `-${form.slice(stem.length)}`}</strong></span>;
          })}
        </div>
      </div>
    </details>
  );
}
