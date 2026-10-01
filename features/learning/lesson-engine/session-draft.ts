// A navigation hint only. D1 remains the authority for completion and saved cards.
export function readDraft(lessonId: string): "learn" | "activity" {
  try { return window.sessionStorage.getItem(`tempo:pending:${lessonId}`) === "activity" ? "activity" : "learn"; }
  catch { return "learn"; }
}

export function writeDraft(lessonId: string, stage: "learn" | "activity" | null) {
  try {
    const key = `tempo:pending:${lessonId}`;
    if (stage === null) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, stage);
  } catch { /* Restricted browser storage must not prevent API persistence. */ }
}
