import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import PracticeScreen from "@/features/practice/PracticeScreen";
import "@/app/globals.css";
import "@/features/practice/adult-lessons.css";
import "@/features/practice/house.css";
import "./pages.css";

function Demo() {
  const presentation = new URLSearchParams(window.location.search).get("mode");
  const initialChildMode = presentation === "child" || presentation === "kingdoms";

  return (
    <div className="github-pages-demo">
      <header className="demo-intro">
        <div>
          <span>Tempo</span>
          <strong>Европейский португальский</strong>
        </div>
        <details className="demo-info">
          <summary aria-label="О демо-версии">i</summary>
          <div>
            <strong>Интерактивное демо</strong>
            <p>Короткие уроки, тренировка форм и две колоды карточек. Прогресс сохраняется только в этом браузере.</p>
            <a href="https://github.com/kroha22/tempo-react">Исходный код на GitHub →</a>
          </div>
        </details>
      </header>
      <PracticeScreen initialChildMode={initialChildMode} initialSection="lessons" />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Demo />
  </StrictMode>,
);
