"use client";

import { createContext } from "react";

// The static demo supplies navigation; the server app keeps its normal URLs.
export const RelatedLearningNavigation = createContext<((href: string) => void) | null>(null);
