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
        <span>Интерактивное демо</span>
        <h1>Европейский португальский — коротко и на практике</h1>
        <p>Откройте урок, потренируйте формы или выберите одну из двух колод: 1 000 частотных глаголов и «351 базовое слово». Прогресс интервального повторения сохраняется только в этом браузере.</p>
        <a href="https://github.com/kroha22/tempo-react">Исходный код на GitHub →</a>
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
