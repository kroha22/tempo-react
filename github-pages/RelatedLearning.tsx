import {ActivityCompletion} from "@/features/practice/ActivityCompletion";
import {ReadingLessons} from "@/features/practice/ReadingLessons";
import {ClothingTopic} from "@/features/practice/ClothingTopic";
import {IntroductionTopic} from "@/features/practice/IntroductionTopic";
import {CityTopic} from "@/features/practice/CityTopic";
import {WorkStudyTopic} from "@/features/practice/WorkStudyTopic";
import {LegacyLessonLink} from "@/features/practice/LegacyLessonLink";
import { useState } from "react";
import { routeLessonExperiences } from "@/features/content/first-vertical-slice/route-extension";
import { CardSpeechButton } from "@/features/cards/components/CardSpeechButton";
import PracticeScreen from "@/features/practice/PracticeScreen";
import { ClockLesson } from "@/features/practice/ClockLesson";
import { FutureLesson } from "@/features/practice/FutureLesson";
import { PastSuns } from "@/features/practice/PastSuns";
import { TrazerLesson } from "@/features/practice/TrazerLesson";
import { EverydayLesson } from "@/features/practice/EverydayLesson";
import { verbs, type VerbKey } from "@/features/conjugation/data";
import {shortGrammarLessons} from "@/features/content/short-grammar-lessons";
import { GrammarCourse } from "@/features/learning/gramatica/GrammarCourse";
import { localTransport } from "../shared/http/local-transport";
import {BeingLesson} from "@/features/practice/BeingLesson";
import {beingDestination,beingDestinationForHref} from "@/features/practice/being-navigation";
import {GeneralPlan} from "@/features/learning/plan/GeneralPlan";
import {PlanWords} from "@/features/learning/plan/PlanWords";
import {PlanSchoolLesson} from "@/features/learning/plan/PlanSchoolLesson";
import {PlanActivity} from "@/features/learning/plan/PlanActivity";
import {TimeDayFlow} from "@/features/practice/TimeDayFlow";
import {FamilyCards} from "@/features/cards/saved-items/FamilyCards";
import {FamilyFlow} from "@/features/practice/FamilyFlow";
import {FoodCards} from "@/features/cards/saved-items/FoodCards";
import {BodyCards} from "@/features/cards/saved-items/BodyCards";
import {BodyFlow} from "@/features/practice/BodyFlow";
import {HomeCards} from "@/features/cards/saved-items/HomeCards";
import {HomeFlow} from "@/features/practice/HomeFlow";
import {homeRouteSources,homeCardsHref} from "@/features/content/home-cards";
import {LegacyCards} from "@/features/cards/saved-items/LegacyCards";
import {legacyCardGroups,legacyCardsHref} from "@/features/content/legacy-cards";
import {FoodFlow} from "@/features/practice/FoodFlow";
import {QuickWords} from "@/features/practice/QuickWords";
import {WordLearningReturn} from "@/features/practice/WordLearningEntry";

export function relatedDestination(href: string) {
  if(href.startsWith("/learning/practice?")){
    const lesson=new URLSearchParams(href.split("?")[1]).get("lesson");
    if(lesson)return shortGrammarLessons.some(item=>item.id===lesson)?{kind:"conjugation" as const}:null;
    const key=new URLSearchParams(href.split("?")[1]).get("verb");
    return key&&key in verbs?{kind:"conjugation" as const}:null;
  }
  if (href === "/learning/everyday/likes" || href === "/learning/everyday/body") return {kind:"everyday" as const,lessonId:href.endsWith("likes")?"likes" as const:"body" as const};
  if (href === "/learning/conjugation") return { kind: "conjugation" as const };
  const prefix = "/learning/lessons/";
  if (!href.startsWith(prefix)) return null;
  try {
    const lesson = routeLessonExperiences.find(item => item.id === decodeURIComponent(href.slice(prefix.length)));
    return lesson ? { kind: "lesson" as const, lesson } : null;
  } catch { return null; }
}

export function RelatedLearning({ href, onBack }: { href: string; onBack: () => void }) {
  const destination = relatedDestination(href);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  if(href==="/learning/plan/words")return <PlanWords/>;
  if(href.split("?")[0]==="/learning/plan/school"){const params=new URLSearchParams(href.split("?")[1]);return <PlanSchoolLesson key={href} unitId={params.get("unit")??undefined} wordsOnly={params.get("words")==="1"}/>;}
  if(href==="/learning/reading")return <ReadingLessons onBack={onBack}/>;
  if(href==="/learning/clothing")return <ClothingTopic onBack={onBack}/>;
  if(href.split("?")[0]==="/learning/introduction"){
    const params=new URLSearchParams(href.split("?")[1]);
    return <IntroductionTopic phase={params.get("phase")??undefined} familyBridge={params.get("activity")==="family"}
      related={params.get("related")??undefined} onBack={onBack}
      renderRelated={(target,back)=>{
        // Keep the family lesson mounted as its phase changes, just as at its direct URL.
        const page=target.split("?")[0];
        return <RelatedLearning key={page==="/learning/family"?page:target} href={target} onBack={back}/>;
      }}/>;
  }
  if(href==="/learning/city")return <CityTopic onBack={onBack}/>;
  if(href==="/learning/work-study")return <WorkStudyTopic onBack={onBack}/>;
  if(href.split("?")[0]==="/learning/quick-words"){const params=new URLSearchParams(href.split("?")[1]);return <QuickWords onBack={onBack} topicId={params.get("topic")??undefined} initialSetId={params.get("set")??undefined} resumeInitial={params.get("resume")==="1"}/>;}
  if(href.split("?")[0]==="/learning/legacy-cards"){const params=new URLSearchParams(href.split("?")[1]);return <LegacyCards group={params.get("group")??undefined} mode={params.get("mode")??undefined} onBack={onBack}/>;}
  if(["/learning/home","/learning/house","/cards/house"].includes(href.split("?")[0])){const params=new URLSearchParams(href.split("?")[1]);return <HomeFlow legacyWords={href==="/cards/house"} topic={params.get("topic")??undefined} phase={href==="/cards/house"?"words":params.get("phase")??undefined} related={params.get("related")??undefined} renderRelated={(href,back)=><RelatedLearning key={href} href={href} onBack={back}/>} onBack={onBack}/>;}
  if(href.split("?")[0]==="/learning/home/cards"){const params=new URLSearchParams(href.split("?")[1]);return <HomeCards topic={params.get("topic")??undefined} mode={params.get("mode")??undefined} source={params.get("source")??undefined} onBack={onBack}/>;}
  if(href.split("?")[0]==="/learning/body"){const params=new URLSearchParams(href.split("?")[1]);return <BodyFlow topic={params.get("topic")??undefined} phase={params.get("phase")??undefined} related={params.get("related")??undefined} onBack={onBack} renderRelated={(target,back)=><RelatedLearning key={beingDestinationForHref(target)?"being-lesson":target} href={target} onBack={back}/>}/>;}
  if(href.split("?")[0]==="/learning/body/cards"){const params=new URLSearchParams(href.split("?")[1]);return <BodyCards topic={params.get("topic")??undefined} mode={params.get("mode")??undefined} source={params.get("source")??undefined} onBack={onBack}/>;}
  if(href.split("?")[0]==="/learning/food"){const params=new URLSearchParams(href.split("?")[1]);return <FoodFlow topic={params.get("topic")??undefined} phase={params.get("phase")??undefined} related={params.get("related")??undefined} onBack={onBack} renderRelated={(target,back)=><RelatedLearning key={beingDestinationForHref(target)?"being-lesson":target} href={target} onBack={back}/>}/>;}
  if(href.split("?")[0]==="/learning/food/cards"){const params=new URLSearchParams(href.split("?")[1]);return <FoodCards topic={params.get("topic")??undefined} mode={params.get("mode")??undefined} onBack={onBack}/>;}
  if(href.split("?")[0]==="/learning/family"){const params=new URLSearchParams(href.split("?")[1]);return <FamilyFlow topic={params.get("topic")??undefined} phase={params.get("phase")??undefined} related={params.get("related")??undefined} onBack={onBack} renderRelated={(target,back)=><RelatedLearning key={beingDestinationForHref(target)?"being-lesson":target} href={target} onBack={back}/>}/>;}
  if(href.split("?")[0]==="/learning/family/cards"){const params=new URLSearchParams(href.split("?")[1]);return <FamilyCards topic={params.get("topic")??undefined} mode={params.get("mode")??undefined} onBack={onBack}/>;}
  if(href.split("?")[0]==="/learning/time-day"){const params=new URLSearchParams(href.split("?")[1]);return <TimeDayFlow topic={params.get("topic")??undefined} phase={params.get("phase")??undefined} related={params.get("related")??undefined} onBack={onBack} renderRelated={(target,back)=><RelatedLearning key={beingDestinationForHref(target)?"being-lesson":target} href={target} onBack={back}/>}/>;}
  if(href==="/learning/plan"||href==="/learning/gramatica-ativa")return <GeneralPlan practiceOnly={!localTransport()}/>;
  if(href.startsWith("/learning/plan/step/")){let id="";try{id=decodeURIComponent(href.slice("/learning/plan/step/".length));}catch{}return <PlanActivity id={id}/>;}
  if (href.startsWith("/learning/gramatica-ativa/")) return <WordLearningReturn value={onBack}><GrammarCourse key={href} slug={href.slice("/learning/gramatica-ativa/".length)} practiceOnly={!localTransport()} /></WordLearningReturn>;
  const practiceParams = href.startsWith("/learning/practice?") ? new URLSearchParams(href.split("?")[1]) : null;
  const requestedVerb = practiceParams?.get("verb") ?? "fazer";
  const grammarLesson=shortGrammarLessons.find(lesson=>lesson.id===practiceParams?.get("lesson"));
  const being=practiceParams?beingDestination(Object.fromEntries(practiceParams)):null;
  if(being)return <section><button type="button" className="tempo-back" onClick={onBack}>← К списку уроков</button><BeingLesson {...being} childMode={practiceParams?.get("mode")==="kingdoms"}/></section>;
  if (destination?.kind === "everyday") return <section><button type="button" className="tempo-back" onClick={onBack}>← Назад</button><EverydayLesson key={href} lessonId={destination.lessonId}/></section>;
  const extra = practiceParams ? <PracticeScreen onOpenLessons={onBack} initialSection={grammarLesson?"lessons":"trainer"} initialGrammarLessonId={grammarLesson?.id} initialChildMode={practiceParams.get("mode")==="kingdoms"} initialChildStep="exercise" initialVerbKey={requestedVerb in verbs ? requestedVerb as VerbKey : "fazer"} initialTense={practiceParams.get("tense") === "past" ? "past" : "present"} /> : href === "/learning/time" ? <ClockLesson /> : href === "/learning/future" ? <FutureLesson /> : href === "/learning/past-suns" ? <PastSuns /> : href === "/learning/trazer" ? <TrazerLesson /> : null;
  if (extra) return <section><button type="button" className="tempo-back" onClick={onBack}>← К урокам</button>{extra}</section>;
  if (!destination) return <section><button type="button" onClick={onBack}>← Вернуться к фразам</button><h1>Урок не найден</h1></section>;
  if (destination.kind === "conjugation") return <section aria-label="Формы настоящего времени">
    <button type="button" className="tempo-back" onClick={onBack}>← Вернуться к фразам</button>
    <h1 tabIndex={-1}>Формы настоящего времени</h1>
    <PracticeScreen onOpenLessons={onBack} initialSection="trainer" initialVerbKey="estar" initialTense="present" />
  </section>;
  const lesson = destination.lesson;
  const activity = lesson.activity;
  const answer = activity.options.find(option => option.id === activity.correctOptionId)!;
  return <section className="house-activity related-lesson" aria-label={lesson.title}>
    <button type="button" className="tempo-back" onClick={onBack}>← Вернуться к фразам</button>
    <span className="tempo-kicker">Короткий урок · {lesson.minutes} мин</span>
    <h1 tabIndex={-1}>{lesson.title}</h1><p>{lesson.canDo}</p>
    <div className="usage-task"><h2>Как это работает</h2><p>{lesson.cue}</p></div>
    <h2>Примеры</h2>
    <div className="usage-examples">{lesson.examples.map(example => <article key={example.pt}><div className="usage-example-copy"><strong lang="pt-PT">{example.pt}</strong><span>{example.ru}</span></div><CardSpeechButton text={example.pt} /></article>)}</div>
    {!!lesson.vocabulary?.length && <><h2>Слова и выражения</h2><dl className="related-lesson-vocabulary">{lesson.vocabulary.map(item => <div key={item.pt}><dt lang="pt-PT">{item.pt}</dt><dd>{item.ru}{item.note && <small>{item.note}</small>}</dd></div>)}</dl></>}
    {legacyCardGroups.filter(group=>group.source.id===lesson.id).map(group=><p key={group.id}><LegacyLessonLink href={legacyCardsHref(group.id)}>Дополнительные карточки и подключение повторения →</LegacyLessonLink></p>)}
    {homeRouteSources.filter(source=>source.id===lesson.id).map(source=><p key={source.id}><LegacyLessonLink href={`${homeCardsHref(source.topic)}&source=route`}>Слова в личные карточки и повторение →</LegacyLessonLink></p>)}
    <div className="usage-task"><h2>Попробуй сам</h2><p>{activity.prompt}</p>{activity.support && <p>{activity.support}</p>}
      <div className="usage-options" aria-label="Варианты ответа">{activity.options.map(option => <button type="button" key={option.id} aria-pressed={selected === option.id} disabled={checked} onClick={() => setSelected(option.id)}>{option.label}</button>)}</div>
      {!checked ? <button type="button" className="usage-check" disabled={!selected} onClick={() => setChecked(true)}>Проверить</button> : <div className={`usage-feedback ${selected === activity.correctOptionId ? "is-correct" : "is-wrong"}`} role="status"><strong>{selected === activity.correctOptionId ? "Верно" : "Посмотри на правильный вариант"}</strong><p>{answer.label}</p><button type="button" onClick={() => { setChecked(false); setSelected(null); }}>Попробовать ещё раз</button></div>}
    </div>
    {checked&&<ActivityCompletion id={lesson.id} title={lesson.title} group="Первые фразы" correct={selected===activity.correctOptionId?1:0} total={1} scoreLabel="Верно"/>}
    <button type="button" onClick={onBack}>← Вернуться к фразам</button>
  </section>;
}
