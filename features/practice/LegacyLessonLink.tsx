"use client";
import { useContext, type ReactNode } from "react";
import { RelatedLearningNavigation } from "./RelatedLearningNavigation";
export function LegacyLessonLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const navigate = useContext(RelatedLearningNavigation);
  const target = href === "/learning" || href === "/learning/grammar" ? "" : href;
  return <a className={className} href={`#${target}`} onClick={event => {if(navigate && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey){event.preventDefault();navigate(target);}}}>{children}</a>;
}
