import { people, verbs, type Tense, type VerbGroup } from "@/features/conjugation/data";
import { verbKeysForGroup } from "@/features/conjugation/resolver";
import styles from "./RulesDeck.module.css";

type RulesDeckProps = {
  group: VerbGroup;
  tense: Tense;
  onBack: () => void;
  onChangeTense: (tense: Tense) => void;
  onStartPractice: () => void;
};

const groupMeaning: Record<VerbGroup, { title: string; copy: string }> = {
  ar: { title: "Действовать и создавать", copy: "Работаем, учимся, разговариваем, собираем и ремонтируем." },
  er: { title: "Жить, расти и понимать", copy: "Заботимся о жизни, еде, воде, росте и новых знаниях." },
  ir: { title: "Двигаться и передавать", copy: "Отправляемся в путь, открываем, решаем и передаём сигналы." },
  irregular: { title: "Особые сигналы", copy: "Формы меняются по-своему — запоминаем их целиком." },
};

export function RulesDeck({ group, tense, onBack, onChangeTense, onStartPractice }: RulesDeckProps) {
  const availableVerbKeys = verbKeysForGroup(group);
  const firstKey = availableVerbKeys[0];
  const firstVerb = verbs[firstKey];

  return (
    <section className={styles.deck} aria-labelledby="rules-title">
      <header className={styles.header}>
        <button className={styles.back} onClick={onBack}><span aria-hidden="true">‹</span> К замкам</button>
        <div>
          <span className={styles.kicker}>Шпаргалка по группе</span>
          <h2 id="rules-title">{group === "irregular" ? "Неправильные глаголы" : `Правила -${group.toUpperCase()}`}</h2>
        </div>
        <div className={`tense-switch ${styles.tense}`} role="group" aria-label="Время в правилах">
          <button className={tense === "present" ? "active" : ""} onClick={() => onChangeTense("present")}>Настоящее</button>
          <button className={tense === "past" ? "active" : ""} onClick={() => onChangeTense("past")}>Раньше</button>
        </div>
      </header>
      <p className={styles.intro}>
        {group === "irregular" ? "У этих глаголов нет одного окончания — знакомимся с каждой особой формой." : `Убираем -${group.toUpperCase()} и добавляем нужное окончание.`}
        <span> Листай карточки →</span>
      </p>
      <div className={styles.meaning}>
        <strong>{groupMeaning[group].title}</strong>
        <span>{groupMeaning[group].copy}</span>
        <div>{availableVerbKeys.map((key) => <b key={key}>{verbs[key].infinitive}</b>)}</div>
      </div>
      <div className={styles.timeRule}>
        <div className={styles.timeIcon} aria-hidden="true">{tense === "present" ? "☀️" : "🕰️"}</div>
        <div className={styles.timeCopy}>
          <span>Когда используем</span>
          <strong>{tense === "present" ? "Presente — обычно и как факт" : "Pretérito perfeito — уже произошло"}</strong>
          <p>{tense === "present" ? "Привычка, расписание, повторяющееся действие или постоянный факт. Для действия прямо сейчас используем estar a + infinitivo." : "Законченное действие или событие в прошлом: случилось и завершилось."}</p>
        </div>
        <div className={styles.markers} aria-label="Слова-подсказки">
          {(tense === "present" ? ["normalmente", "sempre", "todos os dias"] : ["ontem", "já", "na semana passada"]).map((marker) => <span key={marker}>{marker}</span>)}
        </div>
        <div className={styles.timeExample}>
          <small>Пример</small>
          <strong>{tense === "present" ? "Hoje" : "Ontem"} eu {firstVerb.forms[tense].eu}.</strong>
        </div>
      </div>
      <div className={styles.cards} aria-label="Окончания по местоимениям">
        {people.map((person, personIndex) => {
          const firstForm = firstVerb.forms[tense][person.key];
          const stem = group === "irregular" ? "" : firstVerb.infinitive.slice(0, -2);
          const ending = group === "irregular" ? "особая" : firstForm.slice(stem.length);
          return (
            <article className={styles.card} key={person.key}>
              <div className={styles.hero}>
                <span className={styles.person}>{person.label}</span>
                <span className={`${styles.character} ${styles[`sprite${personIndex}`]}`} aria-hidden="true" />
                <strong className={styles.ending}>{group === "irregular" ? "★" : `-${ending}`}</strong>
              </div>
              <div className={styles.examples}>
                {availableVerbKeys.slice(0, 3).map((key) => (
                  <p key={key}><span>{verbs[key].infinitive}</span><b aria-hidden="true">→</b><strong>{person.label} {verbs[key].forms[tense][person.key]}</strong></p>
                ))}
              </div>
            </article>
          );
        })}
      </div>
      <div className={styles.footer}>
        <span>{group === "irregular" ? "★ Запоминаем формы целиком" : "основа + окончание = форма глагола"}</span>
        <button onClick={onStartPractice}>К глаголам <span aria-hidden="true">›</span></button>
      </div>
    </section>
  );
}
