"use client";
import { useContext, type ReactNode } from "react";
import { RelatedLearningNavigation } from "./RelatedLearningNavigation";
export function LegacyLessonLink({ href, children, className,current=false }: { href: string; children: ReactNode; className?: string;current?:boolean }) {
  const navigate = useContext(RelatedLearningNavigation);
  const target = href === "/learning" || href === "/learning/grammar" ? "" : href;
  return <a className={className} aria-current={current?"page":undefined} href={navigate?`#${target}`:href} onClick={event => {if(navigate && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey){event.preventDefault();navigate(target,event.currentTarget);}}}>{children}</a>;
}
