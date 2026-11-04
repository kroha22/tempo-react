import { useEffect, useRef, useState } from "react";
import PracticeScreen from "@/features/practice/PracticeScreen";
import { RelatedLearningNavigation } from "@/features/practice/RelatedLearningNavigation";
import { RelatedLearning } from "./RelatedLearning";
import { PracticePlanProvider } from "@/features/practice/plan/PracticePlanContext";
import { browserPracticePlanStorage } from "./practice-plan-storage";
import { ProfileManager } from "./ProfileManager";
import type { LocalProfile } from "./profiles";
import {useProfileLearning} from "../features/practice/profile-learning";
import {beingDestinationForHref} from "../features/practice/being-navigation";
import {GeneralPlan} from "../features/learning/plan/GeneralPlan";
import {generalPlanHref} from "../features/learning/plan/model";
import {LegacyLessonLink} from "../features/practice/LegacyLessonLink";
import Flashcards from "../features/cards/components/Flashcards";

export function Demo() {
  return <ProfileManager>{profile=><ProfileDemo profile={profile}/>}</ProfileManager>;
}

// Existing unprofiled entry is retained only for focused legacy integration tests.
export function LegacyDemo() {return <PracticePlanProvider storage={browserPracticePlanStorage}><ProfileDemo/></PracticePlanProvider>;}
function ProfileDemo({profile}:{profile?:LocalProfile}) {
  const learning=useProfileLearning();
  const [resumeTopic]=useState(()=>learning?.learning.lastTopicId??null);
  const [href, setHref] = useState(() => window.location.hash.slice(1));
  const main = useRef<HTMLDivElement>(null);
  const related = useRef<HTMLDivElement>(null);
  const previousHref = useRef("");
  const originLink=useRef<HTMLElement|null>(null);
  const returnHref=useRef(profile?generalPlanHref:"");
  const isPlan=!!profile&&(href===""||href===generalPlanHref);
  const isTopics=!!profile&&href==="/learning/topics";
  const isCards=!!profile&&href==="/cards";
  const isRelated=profile?!(isPlan||isTopics||isCards):!!href;
  const presentation = new URLSearchParams(window.location.search).get("mode");
  const initialChildMode = profile?profile.child:presentation === "child" || presentation === "kingdoms";
  useEffect(() => {
    const update = () => setHref(window.location.hash.slice(1));
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  useEffect(() => {
    if (isRelated) {
      previousHref.current = href;
      related.current?.querySelector("h1")?.focus();
    } else if(isPlan){main.current?.querySelector<HTMLHeadingElement>("h1")?.focus();originLink.current=null;
    } else if (previousHref.current) {
      const origin=originLink.current?.isConnected?originLink.current:Array.from(main.current?.querySelectorAll("a") ?? []).find(link => link.getAttribute("href") === `#${previousHref.current}`);
      origin?.focus({preventScroll:true});origin?.scrollIntoView?.({block:"center"});originLink.current=null;
    }
  }, [href,isRelated,isPlan]);
  function navigate(nextHref: string, origin?:HTMLElement) {
    if(nextHref&&!isRelated){returnHref.current=profile?(isTopics?"/learning/topics":isCards?"/cards":generalPlanHref):"";const source=origin??document.activeElement;originLink.current=source instanceof HTMLElement&&main.current?.contains(source)?source:null;}
    window.location.hash = nextHref;
    setHref(nextHref);
    if (nextHref) window.scrollTo(0, 0);
  }
  return <div className="github-pages-demo">
    <header className="demo-intro"><div><span>Tempo</span><strong>Европейский португальский</strong></div>
      <details className="demo-info"><summary aria-label="О демо-версии">i</summary><div><strong>Интерактивное демо</strong><p>Короткие уроки, тренировка форм и колоды карточек. Прогресс сохраняется только в этом браузере.</p><a href="https://github.com/kroha22/tempo-react">Исходный код на GitHub →</a></div></details>
    </header>
    <RelatedLearningNavigation value={navigate}>
      {profile&&<nav className="general-navigation" aria-label="Разделы Tempo"><LegacyLessonLink href={generalPlanHref} current={!isTopics&&!isCards}>Общий план</LegacyLessonLink><LegacyLessonLink href="/learning/topics" current={isTopics}>Все темы</LegacyLessonLink><LegacyLessonLink href="/cards" current={isCards}>Карточки</LegacyLessonLink></nav>}
      <div ref={main} hidden={isRelated}>{profile?<>
        {isPlan&&<GeneralPlan/>}
        <div hidden={!isTopics}><PracticeScreen initialChildMode={initialChildMode} initialSection="vocabulary" resumeTopicId={resumeTopic} onOpenGeneralPlan={()=>navigate(generalPlanHref)} onOpenGeneralCards={()=>navigate("/cards")}/></div>
        <div hidden={!isCards}><Flashcards/></div>
      </>:<PracticeScreen initialChildMode={initialChildMode} initialSection={resumeTopic?"vocabulary":"lessons"} resumeTopicId={resumeTopic}/>}</div>
      {isRelated && <div ref={related}><RelatedLearning key={beingDestinationForHref(href)?"being-lesson":href} href={href} onBack={() => navigate(returnHref.current)} /></div>}
    </RelatedLearningNavigation>
  </div>;
}
