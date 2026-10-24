import { createContext, useContext, type ReactNode } from "react";
import type { LocalCardProgressStorage } from "../api/progress";

const Context = createContext<LocalCardProgressStorage | undefined>(undefined);
export const useLocalCardProgress = () => useContext(Context);
export function LocalCardProgress({storage,children}:{storage:LocalCardProgressStorage;children:ReactNode}) {
  return <Context value={storage}>{children}</Context>;
}
