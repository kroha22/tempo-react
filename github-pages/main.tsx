import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import PracticeScreen from "@/features/practice/PracticeScreen";
import "@/app/globals.css";
import "@/features/practice/adult-lessons.css";
import "./pages.css";

function Demo() {
  return (
    <div className="github-pages-demo">
      <header className="demo-intro">
        <span>Интерактивное демо</span>
        <h1>Европейский португальский — коротко и на практике</h1>
        <p>Откройте урок, изучите одну из 8 тем, найдите слово в каталоге из 351 позиции или повторите глаголы в колоде из 1 000 карточек. Прогресс карточек сохраняется только в этом браузере.</p>
        <a href="https://github.com/kroha22/tempo-react">Исходный код на GitHub →</a>
      </header>
      <PracticeScreen />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Demo />
  </StrictMode>,
);
