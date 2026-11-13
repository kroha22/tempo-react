import {preparationUnits} from "./test-preparation";
import {preparationPhonics} from "./preparation-phonics";
import {preparationWords} from "./preparation-words";
import {insideBodyImage} from "./body-scenes";

// F-01 inventory only. Destinations are planned homes, not registered routes,
// completion IDs or a replacement for preparationUnits.
export const preparationMigrationHomes = [
  {unitId:"letters",home:"reading",availability:"local-reading"},
  {unitId:"r-rr",home:"reading",availability:"local-reading"},
  {unitId:"s-ss",home:"reading",availability:"local-reading"},
  {unitId:"c-cedilla",home:"reading",availability:"local-reading"},
  {unitId:"s-z",home:"reading",availability:"local-reading"},
  {unitId:"g-gu",home:"reading",availability:"local-reading"},
  {unitId:"nasal",home:"reading",availability:"local-reading"},
  {unitId:"digraphs",home:"reading",availability:"local-reading"},
  {unitId:"x-sounds",home:"reading",availability:"local-reading"},
  {unitId:"clusters",home:"reading",availability:"local-reading"},
  {unitId:"hours",home:"time-and-day",availability:"preparation-only"},
  {unitId:"months",home:"time-and-day",availability:"preparation-only"},
  {unitId:"ordinals-first",home:"school-ordinals",availability:"preparation-only"},
  {unitId:"ordinals-last",home:"school-ordinals",availability:"preparation-only"},
  {unitId:"cooperation",home:"cooperation",availability:"preparation-only"},
  {unitId:"bones",home:"body",availability:"preparation-only"},
  {unitId:"organs",home:"body",availability:"preparation-only"},
  {unitId:"prevention",home:"health",availability:"preparation-only"},
  {unitId:"wellbeing",home:"health",availability:"preparation-only"},
  {unitId:"timeline",home:"school-timeline",availability:"preparation-only"},
] as const;

export function preparationMigrationInventory(){
  return preparationMigrationHomes.map(home=>{
    const unit=preparationUnits.find(unit=>unit.id===home.unitId)!;
    const activityIds:string[]=unit.id==="letters"?["prep:phonics:letters:vowels","prep:phonics:letters:consonants"]:unit.subject==="portuguese"?[`prep:phonics:${unit.id}`]:[`prep:${unit.id}`];
    if(unit.id==="hours")activityIds.push("clock:read","clock:set");
    if(unit.id==="months")activityIds.push("prep:months:order","prep:months:days");
    if(unit.id==="organs")activityIds.push(`image:${insideBodyImage.id}`);
    return {...home,title:unit.title[1],subject:unit.subject,
      primaryActivityIds:activityIds,keywordWordIds:preparationWords(unit.id).map(word=>word.id),
      pairsActivityId:`pairs:prep-keywords:${unit.id}`,
      searchActivityContract:'wordActivityId("search", board.words.map(word => word.id))',
      phonicsWords:(preparationPhonics[unit.id]??[]).map(word=>({...word})),
      // Retain links even when an embedded exercise currently hides its button.
      target:unit.target??null,questionCount:unit.questions.length,
      shortQuizRendered:unit.subject!=="portuguese",
      paperSheet:({cooperation:1,bones:2,organs:2,prevention:3,wellbeing:3} as Record<string,number>)[unit.id]??null,
    };
  });
}
