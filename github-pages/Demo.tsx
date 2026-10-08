import { useEffect, useRef, useState } from "react";
import PracticeScreen from "@/features/practice/PracticeScreen";
import { RelatedLearningNavigation } from "@/features/practice/RelatedLearningNavigation";
import { RelatedLearning } from "./RelatedLearning";

export function Demo() {
  const [href, setHref] = useState(() => window.location.hash.slice(1));
  const main = useRef<HTMLDivElement>(null);
  const related = useRef<HTMLDivElement>(null);
  const previousHref = useRef("");
  const presentation = new URLSearchParams(window.location.search).get("mode");
  const initialChildMode = presentation === "child" || presentation === "kingdoms";
  useEffect(() => {
    const update = () => setHref(window.location.hash.slice(1));
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  useEffect(() => {
    if (href) {
      previousHref.current = href;
      related.current?.querySelector("h1")?.focus();
    } else if (previousHref.current) {
      Array.from(main.current?.querySelectorAll("a") ?? []).find(link => link.getAttribute("href") === `#${previousHref.current}`)?.focus();
    }
  }, [href]);
  function navigate(nextHref: string) {
    window.location.hash = nextHref;
    setHref(nextHref);
    if (nextHref) window.scrollTo(0, 0);
  }
  return <div className="github-pages-demo">
    <header className="demo-intro"><div><span>Tempo</span><strong>Европейский португальский</strong></div>
      <details className="demo-info"><summary aria-label="О демо-версии">i</summary><div><strong>Интерактивное демо</strong><p>Короткие уроки, тренировка форм и колоды карточек. Прогресс сохраняется только в этом браузере.</p><a href="https://github.com/kroha22/tempo-react">Исходный код на GitHub →</a></div></details>
    </header>
    <RelatedLearningNavigation value={navigate}>
      <div ref={main} hidden={!!href}><PracticeScreen initialChildMode={initialChildMode} initialSection="lessons" /></div>
      {!!href && <div ref={related}><RelatedLearning key={href} href={href} onBack={() => navigate("")} /></div>}
    </RelatedLearningNavigation>
  </div>;
}
