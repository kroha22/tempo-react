"use client";
import {useState} from "react";
import {preparationPhonics} from "../content/preparation-phonics";
import {CardSpeechButton} from "../cards/components/CardSpeechButton";
import {ActivityCompletion} from "./ActivityCompletion";
import {LessonText,useLessonText} from "./LessonText";
import styles from "./TestPreparation.module.css";

// Names, not isolated phonemes: Acordo Ortográfico, Base I.
export const alphabetNames=["á","bê","cê","dê","é","efe","gê","agá","i","jota","capa","ele","eme","ene","ó","pê","quê","erre","esse","tê","u","vê","dáblio","xis","ípsilon","zê"] as const;
export function AlphabetSounds(){
  return <div className={styles.alphabetSounds} aria-label="Послушай названия букв">{Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map((letter,i)=><div key={letter}><CardSpeechButton text={alphabetNames[i]} label={`Буква ${letter}`}><span>{letter} {letter.toLowerCase()}</span></CardSpeechButton><small lang="pt-PT">{alphabetNames[i]}</small></div>)}</div>;
}

export function PhonicsExamples({id}:{id:string}){
  const words=preparationPhonics[id];
  if(id==="letters")return <section><h4><LessonText text="Letras e sons" translation="Буквы и звуки"/></h4><p><LessonText text="As cinco letras vogais são A, E, I, O e U. Os acentos, como em á e ê, não criam novas letras do alfabeto." translation="Пять гласных букв — A, E, I, O, U. Знаки ударения, например в á и ê, не создают новых букв алфавита."/></p><p><LessonText text="Os sons também podem ser surdos ou sonoros. Põe a mão na garganta: no som inicial de vaca há vibração; no de faca, não. Compara os sons, não apenas as letras." translation="Звуки бывают глухими и звонкими. Положи руку на горло: при первом звуке vaca ощущается вибрация, при первом звуке faca — нет. Сравнивай звуки, а не только буквы."/></p><div className={styles.soundWords}>{[["faca","нож"],["vaca","корова"]].map(([word,meaning])=><span key={word}><CardSpeechButton text={word}/><b><LessonText text={word} translation={meaning} keepPortuguese/></b></span>)}</div></section>;
  if(!words)return null;
  return <section className={styles.embedded} aria-label="Слова для прослушивания"><h4><LessonText text="Ouve e repete" translation="Послушай и повтори"/></h4><div className={styles.soundWords}>{words.map(item=><span key={item.word}><CardSpeechButton text={item.word}/><b><LessonText text={item.word} translation={item.meaning} keepPortuguese/></b></span>)}</div></section>;
}

export function PreparationPhonics({id}:{id:string}){
  const help=useLessonText(),ru=help?.translated;
  const words=preparationPhonics[id]??[];
  const groups=[...new Set(words.map(w=>w.group))];
  const [answers,setAnswers]=useState<Record<string,string>>({}),[checked,setChecked]=useState(false);
  const [alphabet,setAlphabet]=useState<string[]>([]),[kind,setKind]=useState<"vowels"|"consonants">("vowels");
  const letters=Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  const correctLetters=letters.filter(l=>kind==="vowels"?"AEIOU".includes(l):!"AEIOU".includes(l));
  const exact=alphabet.length===correctLetters.length&&alphabet.every(l=>correctLetters.includes(l));
  function reset(){setAnswers({});setAlphabet([]);setChecked(false);}
  if(id==="letters")return <section aria-label="Практика алфавита"><h3><LessonText text="Descobre o alfabeto" translation="Исследуй алфавит"/></h3><div className={styles.subjects}>{(["vowels","consonants"] as const).map(k=><button key={k} type="button" aria-pressed={kind===k} onClick={()=>{setKind(k);reset();}}>{k==="vowels"?(ru?"Гласные":"Vogais"):(ru?"Согласные":"Consoantes")}</button>)}</div><p><LessonText text={kind==="vowels"?"Seleciona as cinco letras vogais.":"Seleciona as vinte e uma letras consoantes."} translation={kind==="vowels"?"Выдели пять гласных букв.":"Выдели двадцать одну согласную букву."}/></p><div className={styles.letterButtons}>{letters.map(l=><button key={l} type="button" aria-label={`${l} ${l.toLowerCase()}`} aria-pressed={alphabet.includes(l)} disabled={checked} onClick={()=>setAlphabet(alphabet.includes(l)?alphabet.filter(v=>v!==l):[...alphabet,l])}><span>{l}</span><small>{l.toLowerCase()}</small></button>)}</div><p><LessonText text="As letras não são os sons. K, W e Y também fazem parte do alfabeto; aparecem, por exemplo, em nomes e palavras de origem estrangeira." translation="Буквы и звуки — разное. K, W и Y тоже входят в алфавит: например, встречаются в именах и заимствованных словах."/></p>{!checked?<button type="button" onClick={()=>setChecked(true)}>{ru?"Проверить":"Verificar"}</button>:<ActivityCompletion id={`prep:phonics:letters:${kind}`} title="Алфавит" group="Слова в жизни" correct={Number(exact)} total={1}><p role="status">{exact?(ru?"Верно!":"Correto!"):(ru?"Сверь выделение с ответом:":"Compara com a resposta:")} {correctLetters.join(" · ")}</p><button type="button" onClick={reset}>{ru?"Повторить":"Repetir"}</button></ActivityCompletion>}</section>;
  if(!words.length)return null;
  const score=words.filter(w=>answers[w.word]===w.group).length;
  return <section aria-label="Вставь сочетания букв"><h3><LessonText text={id==="x-sounds"?"Que som tem o X?":"Completa e organiza as palavras"} translation={id==="x-sounds"?"Как звучит X?":"Заполни пропуски и распредели слова"}/></h3><p><LessonText text={id==="x-sounds"?"Ouve cada palavra e escolhe o som do X. Os nomes dos grupos são pistas de leitura.":"Ouve a palavra, usa a pista e escolhe as letras que faltam. Depois verifica tudo."} translation={id==="x-sounds"?"Послушай каждое слово и выбери звук X. Названия групп — подсказки для чтения.":"Послушай слово, прочитай подсказку и выбери пропущенные буквы. Потом проверь всё."}/></p><div className={styles.spellingPool}>{words.map(w=><article key={w.word}><div><CardSpeechButton text={w.word}/><b lang="pt-PT">{checked||id==="x-sounds"?w.word:w.word.replace(w.segment,"___")}</b></div><small>{w.meaning}</small><div className={styles.spellingChoices}>{groups.map(g=><button key={g} type="button" aria-label={`${w.meaning}: ${g}`} aria-pressed={answers[w.word]===g} disabled={checked} onClick={()=>setAnswers({...answers,[w.word]:g})}>{g.toUpperCase()}</button>)}</div>{checked&&<p>{answers[w.word]===w.group?"✓":"✗"} {w.word} → {w.group.toUpperCase()}</p>}</article>)}</div>{!checked?<button type="button" disabled={Object.keys(answers).length!==words.length} onClick={()=>setChecked(true)}>{ru?"Проверить":"Verificar"}</button>:<ActivityCompletion id={`prep:phonics:${id}`} title="Буквы и звуки" group="Слова в жизни" correct={score} total={words.length}><p role="status">{score} / {words.length}</p><button type="button" onClick={reset}>{ru?"Повторить":"Repetir"}</button></ActivityCompletion>}</section>;
}
