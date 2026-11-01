"use client";

import { createContext } from "react";

// The demo retains the originating link for return focus; the server app keeps normal URLs.
export const RelatedLearningNavigation = createContext<((href: string, origin?:HTMLElement) => void) | null>(null);
