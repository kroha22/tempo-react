"use client";
import { useContext, type ReactNode } from "react";
import { RelatedLearningNavigation } from "./RelatedLearningNavigation";
import {LearningReturnOrigin} from "./LearningReturnOrigin";
export function LegacyLessonLink({ href, children, className,current=false }: { href: string; children: ReactNode; className?: string;current?:boolean }) {
  const navigate = useContext(RelatedLearningNavigation);
  const origin=useContext(LearningReturnOrigin);
  const returning=origin&&href==="/learning/plan"&&typeof children==="string"&&children.includes("К общему плану");
  if(returning){href=origin;children=typeof children==="string"?children.replace("К общему плану","К каталогу тем"):children;}
  const target = href === "/learning" || href === "/learning/grammar" ? "" : href;
  return <a className={className} aria-current={current?"page":undefined} href={navigate?`#${target}`:href} onClick={event => {if(navigate && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey){event.preventDefault();navigate(target,event.currentTarget);}}}>{children}</a>;
}
