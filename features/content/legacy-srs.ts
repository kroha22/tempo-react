import {studyItems,examples} from "./first-vertical-slice/l1.ts";
import {extraStudyItems,extraExamples,routeExtensionRu,routeLessonExperiences} from "./first-vertical-slice/route-extension.ts";
import {legacyExamples,legacyExampleRu} from "./legacy-example-repairs.ts";
import {ru} from "./locale/ru.ts";

// Source-only bridge. No manifest, review catalog or production import of the plan JSON.
export const legacySrsIds=[
  "study:chunk:ola","study:chunk:como-te-chamas","study:chunk:chamo-me","study:chunk:sou-name","study:chunk:muito-prazer",
  "study:verb:ser:identity","study:verb:estar:state","study:verb:ter:possession","study:verb:ficar:location","study:chunk:onde-fica",
  "study:noun:cama","study:noun:armario","study:noun:copo","study:noun:estacao","study:noun:hotel","study:noun:farmacia","study:noun:centro",
] as const;
const texts:Record<string,string>={...ru,...routeExtensionRu,...legacyExampleRu};
const items=[...studyItems,...extraStudyItems],allExamples=[...examples,...extraExamples,...legacyExamples];
export const legacySrsWords=legacySrsIds.map(studyItemId=>{
  const item=items.find(item=>item.id===studyItemId);
  if(!item)throw Error(`Missing legacy target: ${studyItemId}`);
  const display=item.display,example=allExamples.find(example=>example.id===item.defaultExampleId);
  if(!example)throw Error(`Missing legacy example: ${studyItemId}`);
  const pt=display.type==="noun"?`${display.definiteArticle} ${display.lemma} — ${display.pluralDefiniteArticle} ${display.plural}`:display.type==="verb"?display.infinitive:display.text;
  return {studyItemId,pt,ru:texts[display.translationKey],example:{pt:example.text,ru:texts[example.translationKey]},infinitive:display.type==="verb"?display.infinitive:undefined};
});
export const legacyRouteSources=["lesson:a1-1:introduce-yourself","lesson:a1-1:ser-estar-description-state","lesson:a1-1:ask-place-location"].map(id=>{
  const lesson=routeLessonExperiences.find(lesson=>lesson.id===id)!;
  return {id,title:lesson.title,href:`/learning/lessons/${encodeURIComponent(id)}`};
});
