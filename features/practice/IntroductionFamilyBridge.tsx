"use client";
import {useEffect,useRef,useState} from "react";
import {familyFlowHref,familyGlossary} from "../content/family-flow";
import {familyPossessives} from "../content/family-lesson";
import {vocabularyForUnit,vocabularyFront} from "../content/gramatica-vocabulary";
import {normalizeConversation} from "../content/introduction-conversation";
import {wordBatchHref} from "../learning/gramatica/first-units";
import {DescriptionParagraph,DescriptionReading} from "./DescriptionReading";
import {LegacyLessonLink} from "./LegacyLessonLink";
import styles from "./IntroductionConversation.module.css";
import flowStyles from "./IntroductionFlow.module.css";

const siblingWords=vocabularyForUnit(36).filter(word=>word.lemma==="irmão"||word.lemma==="irmã");
const mother=familyPossessives.find(row=>row.form==="minha")!;
const father=familyPossessives.find(row=>row.form==="meu")!;
const headings={article:"Брат или сестра?",question:"Как спросить, кто это?",family:"Кто на фотографии?"};

export function IntroductionFamilyBridge({active}:{active:boolean}){
  const [step,setStep]=useState<keyof typeof headings>("article");
  const [article,setArticle]=useState("");
  const [question,setQuestion]=useState("");
  const [feedback,setFeedback]=useState("");
  const heading=useRef<HTMLHeadingElement>(null);

  useEffect(()=>{
    if(active){
      heading.current?.focus({preventScroll:true});
      heading.current?.scrollIntoView?.({block:"start"});
    }
  },[step,active]);

  function checkQuestion(){
    const answer=normalizeConversation(question);
    if(answer==="quem é"){
      setStep("family");
    }else if(answer==="quem e"){
      setFeedback("Поставьте ударение в форме глагола: é.");
    }else{
      setFeedback("Вы хотите узнать, кто этот человек. Начните с quem и добавьте форму SER.");
    }
  }

  return <section aria-label="Представить близкого">
    <h3 ref={heading} tabIndex={-1}>{headings[step]}</h3>
    {step==="article"&&<>
      <DescriptionReading glossary={familyGlossary}>
        <DescriptionParagraph pt="«Sou a Rita. Sou estudante.» Uso a antes do nome Rita. Para dizer o que faço, basta «Sou estudante»."
          ru="«Я Рита. Я студентка». Здесь перед именем Rita стоит артикль a. Когда Рита говорит о своём занятии, достаточно Sou estudante."/>
        <DescriptionParagraph pt="Na minha família, digo «o meu irmão» e «a minha irmã». O artigo acompanha o nome."
          ru="О своих близких я говорю o meu irmão — «мой брат» и a minha irmã — «моя сестра». Артикль согласуется с существительным."/>
      </DescriptionReading>
      <div className={styles.conversation}>
        <p>Рита представляет сестру. Вставьте артикль в её фразу.</p>
        <p lang="pt-PT"><strong>É ___ minha irmã.</strong></p>
        <div className={styles.actions} role="group" aria-label="Выберите артикль">
          {["o","a"].map(choice=><button key={choice} lang="pt-PT" type="button" aria-pressed={article===choice} onClick={()=>setArticle(choice)}>{choice}</button>)}
        </div>
        {article&&<p role="status">{article==="a"?<>Верно. <strong lang="pt-PT">É a minha irmã.</strong> — «Это моя сестра».</>:"Irmã — существительное женского рода. Попробуйте ещё раз."}</p>}
        {article==="a"&&<button type="button" onClick={()=>setStep("question")}>Перейти к вопросу →</button>}
      </div>
      <details><summary>Брат и сестра в U36</summary>
        <ul>{siblingWords.map(word=><li key={word.studyItemId}><span lang="pt-PT">{vocabularyFront(word)}</span> · {word.translation}</li>)}</ul>
        <LegacyLessonLink className={flowStyles.link} href={wordBatchHref(36)}>Слова U36 →</LegacyLessonLink>
      </details>
    </>}
    {step==="question"&&<>
      <DescriptionReading glossary={familyGlossary}>
        <DescriptionParagraph pt={`Para saber quem está na fotografia, pergunto «Quem é?». A Rita responde «É ${father.example}».`}
          ru={`Чтобы узнать, кто на фотографии, я спрашиваю Quem é? — «Кто это?». Рита отвечает É ${father.example}. — «Это ${father.translation}».`}/>
      </DescriptionReading>
      <form className={styles.conversation} onSubmit={event=>{event.preventDefault();checkQuestion();}}>
        <p>Теперь Рита показывает фотографию женщины. Спросите двумя словами, кто это.</p>
        <label>Ваш вопрос<input lang="pt-PT" autoComplete="off" spellCheck={false} value={question} onChange={event=>{setQuestion(event.target.value);setFeedback("");}}/></label>
        {feedback&&<p role="status">{feedback}</p>}
        <div className={styles.actions}><button type="submit" disabled={!question.trim()}>Спросить Риту</button></div>
      </form>
      <LegacyLessonLink className={flowStyles.link} href={wordBatchHref(40)}>Слова U40 →</LegacyLessonLink>
    </>}
    {step==="family"&&<>
      <p>Вы спросили <strong lang="pt-PT">Quem é?</strong></p>
      <p>Рита отвечает <strong lang="pt-PT">É {mother.example}.</strong> — «Это {mother.translation}».</p>
      <LegacyLessonLink className={flowStyles.link} href={familyFlowHref("close","explanation")}>Открыть урок «Моя семья и близкие» →</LegacyLessonLink>
    </>}
  </section>;
}
