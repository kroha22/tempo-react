import type {BeingVerb} from "./practice-types.ts";
export type BeingDestination={view:"explanation"|"forms";verb:BeingVerb};
export function beingDestination(query:{lesson?:string;verb?:string;tense?:string;view?:string;mode?:string}):BeingDestination|null{
  if(["ser","estar","ser-estar"].includes(query.lesson??""))return {view:query.view==="forms"?"forms":"explanation",verb:query.verb==="estar"||(!query.verb&&query.lesson==="estar")?"estar":"ser"};
  if(!query.lesson&&query.tense!=="past"&&query.mode!=="kingdoms"&&(query.verb==="ser"||query.verb==="estar"))return {view:"forms",verb:query.verb};
  return null;
}
export function beingHref(view:"explanation"|"forms"="explanation",verb:BeingVerb="ser",child=false){
  return `/learning/practice?lesson=ser-estar${view==="forms"?`&view=forms&verb=${verb}`:""}${child?"&mode=kingdoms":""}`;
}
export function beingDestinationForHref(href:string){
  const prefix="/learning/practice?";
  return href.startsWith(prefix)?beingDestination(Object.fromEntries(new URLSearchParams(href.slice(prefix.length)))):null;
}
