"use client";

import { useRef, useState } from "react";
import type { VocabularyWord } from "../content/vocabulary-model";
import { extendSearchPath, findSearchWord, makeSearchBoard, searchPathText, searchWords } from "./word-search";

export function WordSearch({ words }: { words: readonly VocabularyWord[] }) {
  const eligible = searchWords(words);
  const [batch, setBatch] = useState(0);
  const [board, setBoard] = useState(() => makeSearchBoard(eligible.slice(0, 10), 731));
  const [selection, setSelection] = useState<readonly number[]>([]);
  const [found, setFound] = useState<Record<string, readonly number[]>>({});
  const [focus, setFocus] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState(false);
  const dragPath = useRef<readonly number[]>([]);
  const dragMoved = useRef(false);
  const dragging = useRef(false);
  const suppressClick = useRef(false);

  const completed = Object.keys(found).length === board.words.length;
  const painted = new Set(Object.values(found).flat());
  const selected = new Set(selection);

  function describeSelection(path: readonly number[]) {
    const text = searchPathText(board, path);
    return text ? `Собрано: ${text}` : "";
  }

  function finishSelection(path: readonly number[], keepPartial: boolean) {
    const word = findSearchWord(board, path);
    if (word) {
      setSelection([]);
      if (found[word.id]) {
        setMessage("Это слово уже найдено.");
        return;
      }
      setFound((previous) => ({ ...previous, [word.id]: path }));
      setMessage(`✓ ${word.label} — ${word.translation.toLowerCase()}`);
      return;
    }

    const text = searchPathText(board, path);
    const canContinue = board.words.some((candidate) => {
      if (found[candidate.id]) return false;
      const reverse = [...candidate.letters].reverse().join("");
      return candidate.letters.startsWith(text) || reverse.startsWith(text);
    });
    if (keepPartial && canContinue) {
      setSelection(path);
      setMessage(describeSelection(path));
      return;
    }
    setSelection([]);
    setMessage("Такого слова нет. Начни с другой буквы.");
  }

  function selectLetter(index: number) {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (!selection.length) {
      setSelection([index]);
      setMessage(describeSelection([index]));
      return;
    }
    const nextPath = extendSearchPath(board.size, selection, index);
    if (!nextPath.length) {
      setSelection([index]);
      setMessage("Продолжай по прямой линии от новой буквы.");
      return;
    }
    finishSelection(nextPath, true);
  }

  function startDrag(index: number) {
    dragging.current = true;
    dragMoved.current = false;
    dragPath.current = [index];
  }

  function continueDrag(index: number) {
    if (!dragging.current) return;
    const nextPath = extendSearchPath(board.size, dragPath.current, index);
    if (!nextPath.length || nextPath === dragPath.current) return;
    dragMoved.current = true;
    dragPath.current = nextPath;
    setSelection(nextPath);
    setMessage(describeSelection(nextPath));
  }

  function endDrag() {
    if (!dragging.current) return;
    dragging.current = false;
    if (!dragMoved.current) return;
    suppressClick.current = true;
    window.setTimeout(() => { suppressClick.current = false; }, 0);
    finishSelection(dragPath.current, false);
  }

  function next(nextBatch: number, seed: number) {
    setBatch(nextBatch);
    setBoard(makeSearchBoard(eligible.slice(nextBatch * 10, nextBatch * 10 + 10), seed));
    setFound({});
    setSelection([]);
    setHint(null);
    setMessage("");
    setConfirm(false);
    setFocus(0);
  }

  return (
    <section
      className="house-activity word-search"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setHint(null);
          setSelection([]);
        }
      }}
      onClick={(event) => {
        if (!(event.target as HTMLElement).closest(".house-word-entry")) setHint(null);
      }}
    >
      <div className="house-heading"><h1>Поиск слов</h1><span>{Object.keys(found).length} / {board.words.length}</span></div>
      <p>Собирай слово по буквам или проведи по нему пальцем. Слова идут по прямой вправо, вниз или по диагонали. Артикли и дефисы в сетку не входят; ç и ударения сохранены.</p>
      <div
        className="word-search-grid"
        role="group"
        aria-label="Поле букв"
        style={{ gridTemplateColumns: `repeat(${board.size},1fr)` }}
        onPointerMove={(event) => {
          if (!dragging.current) return;
          const element = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLButtonElement>("[data-letter-index]");
          if (element) continueDrag(Number(element.dataset.letterIndex));
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={() => { if (dragMoved.current) endDrag(); }}
      >
        {board.cells.map((letter, index) => (
          <button
            type="button"
            key={index}
            data-letter-index={index}
            className={`${painted.has(index) ? "is-found" : ""} ${selected.has(index) ? "is-selected" : ""}`}
            aria-pressed={selected.has(index)}
            tabIndex={focus === index ? 0 : -1}
            onFocus={() => setFocus(index)}
            onPointerDown={() => startDrag(index)}
            onPointerEnter={() => continueDrag(index)}
            onKeyDown={(event) => {
              const offset = ({ ArrowRight: 1, ArrowLeft: -1, ArrowDown: board.size, ArrowUp: -board.size } as Record<string, number>)[event.key];
              if (offset) {
                event.preventDefault();
                const target = Math.max(0, Math.min(board.cells.length - 1, index + offset));
                (event.currentTarget.parentElement?.children[target] as HTMLButtonElement)?.focus();
              }
            }}
            aria-label={`Строка ${Math.floor(index / board.size) + 1}, столбец ${index % board.size + 1}: ${letter}${painted.has(index) ? ", найдено" : ""}`}
            onClick={() => selectLetter(index)}
            lang="pt-PT"
          >{letter}</button>
        ))}
      </div>
      <p className="word-search-status" role="status">{message || "Найди на поле одно из слов из списка."}</p>
      {selection.length > 0 && <button type="button" onClick={() => { setSelection([]); setMessage(""); }}>Отменить выделение</button>}
      <div className="word-search-list">
        {board.words.map((word) => (
          <div className={`house-word-entry has-info ${found[word.id] ? "is-placed" : ""}`} key={word.id}>
            <span className="word-search-label" lang="pt-PT">{found[word.id] ? "✓ " : ""}{word.label}</span>
            <button type="button" className="house-info" aria-label={`Перевод: ${word.label}`} aria-expanded={hint === word.id} onClick={() => setHint(hint === word.id ? null : word.id)}>ⓘ</button>
            {hint === word.id && <div className="house-hint" role="status">{word.translation}</div>}
          </div>
        ))}
      </div>
      {completed && <div className="house-feedback"><h2>Все слова найдены!</h2>{(batch + 1) * 10 < eligible.length ? <button type="button" className="house-primary" onClick={() => next(batch + 1, Math.floor(Math.random() * 2 ** 32))}>Следующие слова →</button> : <p>Тема пройдена. Можно попробовать другой способ изучения.</p>}</div>}
      <div className="house-tools"><span>Набор {batch + 1} из {Math.ceil(eligible.length / 10)}</span><button type="button" onClick={() => setConfirm(true)}>Новое поле</button></div>
      {confirm && <div className="house-reset"><p>Начать этот набор заново с новым расположением букв?</p><button type="button" onClick={() => next(batch, Math.floor(Math.random() * 2 ** 32))}>Да, начать</button><button type="button" onClick={() => setConfirm(false)}>Отмена</button></div>}
    </section>
  );
}
