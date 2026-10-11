"use client";
import { useRef, type PointerEvent } from "react";
import { clockAngles, type ClockTime } from "../content/clock-lesson";

export function LearningClock({ time, onDial, onChange, describe = false }: { time: ClockTime; onDial?: (value: number) => void; onChange?: (time: ClockTime) => void; describe?: boolean }) {
  const face = useRef<HTMLDivElement>(null);
  const drag = useRef<{ hand: "hour" | "minute"; time: ClockTime } | null>(null);
  function begin(event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault(); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { hand: event.currentTarget.dataset.hand === "hour" ? "hour" : "minute", time: { ...time } };
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    if (!drag.current || !face.current || !onChange) return;
    const rect = face.current.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2, y = event.clientY - rect.top - rect.height / 2;
    if (Math.hypot(x, y) < rect.width * .08) return;
    const angle = (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360;
    const previous = drag.current.time;
    let next: ClockTime;
    if (drag.current.hand === "hour") next = { ...previous, hour: ((Math.round(angle / 30 - previous.minute / 60) + 12) % 12) || 12 };
    else {
      const minute = Math.round(angle / 30) % 12 * 5;
      const carry = previous.minute - minute > 30 ? 1 : minute - previous.minute > 30 ? -1 : 0;
      next = { minute, hour: ((previous.hour + carry + 12) % 12) || 12 };
    }
    drag.current.time = next;
    onChange(next);
  }
  const angles = clockAngles(time);
  const endpoint = (angle: number, length: number) => ({ x: Number((100 + length * Math.sin(angle * Math.PI / 180)).toFixed(3)), y: Number((100 - length * Math.cos(angle * Math.PI / 180)).toFixed(3)) });
  const hour = endpoint(angles.hour, 44), minute = endpoint(angles.minute, 65);
  return <div className="learning-clock" ref={face}>
    <svg viewBox="0 0 200 200" role="img" aria-label={describe ? `Часы: ${time.hour}:${String(time.minute).padStart(2, "0")}` : "Часы: короткая толстая стрелка показывает часы, длинная тонкая — минуты"}>
      <circle cx="100" cy="100" r="96" fill="#fffdf2" stroke="#619680" strokeWidth="6" />
      {Array.from({ length: 60 }, (_, i) => { const outer = endpoint(i * 6, 88), inner = endpoint(i * 6, i % 5 === 0 ? 79 : 84); return <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#9baa99" strokeWidth={i % 5 === 0 ? 2 : 1} />; })}
      {Array.from({ length: 12 }, (_, i) => { const n=i+1, p=endpoint(n*30,70); return <text key={n} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fill="#233c32" fontSize="14" fontWeight="800">{n}</text>; })}
      <line x1="100" y1="100" x2={hour.x} y2={hour.y} stroke="#704d96" strokeWidth="8" strokeLinecap="round" />
      <line x1="100" y1="100" x2={minute.x} y2={minute.y} stroke="#bb542f" strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="100" r="5" fill="#233c32" />
    </svg>
    {onDial && Array.from({length:12},(_,i)=> { const n=i+1,p=endpoint(n*30,70); return <button type="button" key={n} className="clock-dial-hit" style={{left:`${p.x/2}%`,top:`${p.y/2}%`}} aria-label={`Отметка ${n}`} onClick={()=>onDial(n)} />; })}
    {onChange && (["hour", "minute"] as const).map(hand => {
      const point = hand === "hour" ? hour : minute;
      return <button type="button" key={hand} className={`clock-hand-grip ${hand}`} style={{ left: `${point.x / 2}%`, top: `${point.y / 2}%` }} aria-label={`Крутить ${hand === "hour" ? "часовую" : "минутную"} стрелку`} data-hand={hand} onPointerDown={begin} onPointerMove={move} onPointerUp={event => { move(event); drag.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }} onKeyDown={event => {
        if (!["ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown"].includes(event.key)) return;
        event.preventDefault(); const delta = event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : -1;
        const total = (time.hour * 60 + time.minute + delta * (hand === "hour" ? 60 : 5) + 720) % 720;
        onChange({ hour: Math.floor(total / 60) || 12, minute: total % 60 });
      }}><span aria-hidden="true">↻</span></button>;
    })}
  </div>;
}
