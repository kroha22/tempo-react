"use client";

// Preserve Cards entry points while both product areas use the same lifecycle.
export {
  SessionQueryBoundary as CardsQueryBoundary,
  EnsureQueryScope as EnsureCardsQueryScope,
  useQueryScope as useCardsScope,
} from "@/shared/query/SessionQueryBoundary";
