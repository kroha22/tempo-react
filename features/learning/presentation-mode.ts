export type PresentationMode = "adult" | "kingdoms";

export function presentationModeParam(mode: PresentationMode) {
  return mode === "kingdoms" ? "?mode=kingdoms" : "";
}

export function routeModeHref(path: string, mode: PresentationMode) {
  return `${path}${presentationModeParam(mode)}`;
}

export function parsePresentationMode(value: string | string[] | undefined): PresentationMode {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "kingdoms" ? "kingdoms" : "adult";
}
