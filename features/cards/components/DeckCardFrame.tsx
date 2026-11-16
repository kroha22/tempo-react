import type { ReactNode } from "react";
import { CardSpeechButton } from "./CardSpeechButton";

export function DeckCardFrame({ children, text, exampleText, disabled = false, onPrevious, onNext }: { children: ReactNode; text: string; exampleText?: string; disabled?: boolean; onPrevious?: () => void; onNext?: () => void }) {
  return <div className={`deck-card-frame ${onPrevious ? "has-arrows" : ""}`}>
    {onPrevious && <button type="button" className="deck-card-arrow" aria-label="Предыдущая карточка" onClick={onPrevious}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m15 6-6 6 6 6" /></svg></button>}
    <div className="deck-card-surface">{children}<div className="deck-card-speaker"><CardSpeechButton text={text} disabled={disabled} /></div>{exampleText && <div className="deck-card-example-speaker"><CardSpeechButton text={exampleText} label="Послушать пример" disabled={disabled} /></div>}</div>
    {onNext && <button type="button" className="deck-card-arrow" aria-label="Следующая карточка" onClick={onNext}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg></button>}
  </div>;
}
