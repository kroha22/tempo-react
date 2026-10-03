"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { makePairBoard, matchPair, shufflePairWords, type PairBoard, type PairWord, type PairBlock } from "./word-pairs";

export function WordPairs({ words, blocks, catalog = false, onComplete, completionLabel = "Готово", footer }: { words: readonly PairWord[]; blocks: readonly PairBlock[]; catalog?: boolean; onComplete?: () => void; completionLabel?: string; footer?: ReactNode }) {
  const packs = blocks.map(block => block.words);
  const wordMap = new Map(words.map(word => [word.id, word]));
  function practiceWord(id: string) { const word = wordMap.get(id); if (!word) throw new Error(`Unknown pair word: ${id}`); return word; }
  const [choosing, setChoosing] = useState(catalog);
  const [pack, setPack] = useState(0);
  const [board, setBoard] = useState(() => makePairBoard(packs[0]));
  const [savedBoards, setSavedBoards] = useState<Record<number, PairBoard>>({});
  const [left, setLeft] = useState<string | null>(null);
  const [right, setRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<string | null>(null);
  const [wrong, setWrong] = useState<{ side: "left" | "right"; id: string } | null>(null);
  const [message, setMessage] = useState("Нажми на слово и его перевод — в любом порядке.");
  const [announcement, setAnnouncement] = useState("");
  const [resetPrompt, setResetPrompt] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busy = useRef(false);
  const pendingPosition = useRef(0);
  const root = useRef<HTMLElement>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function select(side: "left" | "right", id: string, keyboard: boolean, positionSample: number) {
    if (busy.current) return;
    const nextLeft = side === "left" ? left === id ? null : id : left;
    const nextRight = side === "right" ? right === id ? null : id : right;
    setLeft(nextLeft); setRight(nextRight);
    if (!nextLeft || !nextRight) return;
    busy.current = true;
    if (nextLeft !== nextRight) {
      setWrong({ side, id });
      setAnnouncement("Не пара. Выбери слова ещё раз.");
      timer.current = setTimeout(() => {
        setLeft(null); setRight(null); setWrong(null); setAnnouncement(""); busy.current = false;
      }, 500);
      return;
    }
    setMatched(id);
    pendingPosition.current = positionSample;
    const word = practiceWord(id);
    setMessage(`✓ ${word.label} — ${word.translation.toLowerCase()}`);
    setAnnouncement(`Верно: ${word.label} — ${word.translation.toLowerCase()}`);
    const slot = board[side].indexOf(id);
    timer.current = setTimeout(() => {
      setBoard(previous => matchPair(previous, id, id, positionSample));
      setLeft(null); setRight(null); setMatched(null); busy.current = false;
      if (keyboard) requestAnimationFrame(() => {
        const target = root.current?.querySelector<HTMLButtonElement>(`[data-side="${side}"][data-slot="${slot}"]`)
          ?? root.current?.querySelector<HTMLButtonElement>(".house-pair, .house-pack-next");
        target?.focus();
      });
    }, 650);
  }
  const finished = board.completed === packs[pack].length;
  const nextPack = packs.findIndex((words, index) => (index === pack ? board : savedBoards[index])?.completed !== words.length);
  const allDone = finished && nextPack === -1;
  function startPack(index: number, restart = false) {
    if (index === pack && !restart) return;
    if (timer.current) clearTimeout(timer.current);
    busy.current = false;
    const settled = matched ? matchPair(board, matched, matched, pendingPosition.current) : board;
    const next = restart ? makePairBoard(shufflePairWords(packs[index])) : savedBoards[index] ?? makePairBoard(shufflePairWords(packs[index]));
    setSavedBoards(previous => ({ ...previous, [pack]: settled, [index]: next }));
    setPack(index); setBoard(next);
    setLeft(null); setRight(null); setMatched(null); setWrong(null); setAnnouncement("");
    setResetPrompt(false); setMessage("Нажми на слово и его перевод — в любом порядке.");
  }
  if (choosing) return <section className="house-activity pair-catalog" ref={root}>
    <div className="house-heading"><div><span className="tempo-kicker">Слова и выражения по темам</span><h1>Пары слов</h1></div></div>
    <p>Выбери тему и соединяй слова с переводами. До семи пар на экране.</p>
    {[...new Set(blocks.map(block => block.group ?? "Темы"))].map(group => <section key={group} className="pair-catalog-group"><h2>{group}</h2><div className="pair-catalog-grid">{blocks.map((block, index) => {
      if ((block.group ?? "Темы") !== group) return null;
      const count = (index === pack ? board : savedBoards[index])?.completed ?? 0;
      return <button type="button" key={block.id} className="pair-topic" onClick={() => { startPack(index); setChoosing(false); root.current?.scrollIntoView({ block: "start" }); }}><strong>{block.title}</strong><span>Слов и выражений: {block.words.length}</span><small>{count === block.words.length ? "✓ Все пары найдены" : count ? `Найдено: ${count} / ${block.words.length}` : block.sourceLabel}</small></button>;
    })}</div></section>)}
    {footer}
  </section>;
  return <section className="house-activity house-pairs" ref={root}>
    {catalog && <button type="button" className="pair-back" onClick={() => setChoosing(true)}>← Все темы</button>}
    {!catalog && <div className="house-topic-nav" aria-label="Блоки слов">{blocks.map((block, index) => <button type="button" key={block.id} aria-pressed={pack === index} onClick={() => startPack(index)}>{block.title}<small>Слов: {block.words.length}</small></button>)}</div>}
    {!catalog && <label className="house-topic-select">Тема<select aria-label="Блок слов" value={pack} onChange={event => startPack(Number(event.target.value))}>{blocks.map((block, index) => <option key={block.id} value={index}>{block.title} · {block.words.length}</option>)}</select></label>}
    <div className="house-heading"><div><span className="tempo-kicker">{blocks[pack].title}</span><h1>Найди перевод</h1></div><span>{board.completed} / {packs[pack].length}</span></div>
    <p className="house-pair-message">{message}</p>
    <span className="house-sr-only" role="status">{announcement}</span>
    {!finished ? <div className="house-pair-board">
      {(["left", "right"] as const).map(side => <div key={side} className="house-pair-column" aria-label={side === "left" ? "Португальские слова" : "Русские переводы"}>
        <span className="house-column-label">{side === "left" ? "Português" : "Русский"}</span>
        {board[side].map((id, index) => id ? <button key={id} type="button" data-word-id={id} data-side={side} data-slot={index} className={`house-pair ${matched === id ? "is-match" : ""} ${wrong?.side === side && wrong.id === id ? "is-wrong" : ""}`} aria-pressed={(side === "left" ? left : right) === id} aria-disabled={!!matched || !!wrong} onClick={event => select(side, id, event.detail === 0, Math.random())} lang={side === "left" ? "pt-PT" : "ru"}>{matched === id && <span aria-hidden="true">✓ </span>}{wrong?.side === side && wrong.id === id && <span aria-hidden="true">× </span>}{side === "left" ? practiceWord(id).label : practiceWord(id).translation}</button> : <div key={`empty-${index}`} className="house-pair-empty" />)}
      </div>)}
    </div> : <div className="house-feedback"><h2>{allDone ? "Все блоки пройдены!" : "Блок пройден!"}</h2><p>{allDone ? "Все пары найдены. Можно повторить любую тему." : "Все пары закончились. Можно отдохнуть или продолжить."}</p>{allDone ? <button type="button" className="house-primary house-pack-next" onClick={onComplete ?? (() => setChoosing(true))}>{completionLabel}</button> : <button type="button" className="house-primary house-pack-next" onClick={() => startPack(nextPack)}>Дальше: {blocks[nextPack].title} →</button>}</div>}
    <div className="house-tools"><button type="button" onClick={() => setResetPrompt(true)}>Повторить блок</button>{footer}</div>
    {catalog && blocks[pack].sourceHref && <p className="pair-source"><a href={blocks[pack].sourceHref!}>{blocks[pack].sourceLabel ?? "К источнику слов"} →</a></p>}
    {resetPrompt && <div className="house-reset"><span>Начать этот блок заново?</span><button type="button" onClick={() => startPack(pack, true)}>Да, начать</button><button type="button" onClick={() => setResetPrompt(false)}>Отмена</button></div>}
  </section>;
}
