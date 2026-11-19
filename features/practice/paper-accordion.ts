import type {VocabularyWord} from "../content/vocabulary-model";

export type PaperPhase="fold"|"copy"|"recall"|"check";
export type PaperColumn=3|4|5|6;
export type PaperSession={phase:PaperPhase;column:PaperColumn;hints:Record<string,1|2>;marks:Record<string,"independent"|"repeat">;subset:readonly string[]|null;retry:boolean};
export const newPaperSession=():PaperSession=>({phase:"fold",column:3,hints:{},marks:{},subset:null,retry:false});
/** A presentation of the original word; never a new card or word identity. */
export function paperPortuguese(word:VocabularyWord):string{
  const plural=word.noun?[word.noun.pluralArticle,word.noun.plural].filter(Boolean).join(" "):"";
  return plural&&!word.label.includes(plural)?`${word.label} / ${plural}`:word.label;
}
export const paperWritesPortuguese=(session:PaperSession)=>session.column%2===1;
export function paperRows(words:readonly VocabularyWord[],session:PaperSession){return session.subset?words.filter(word=>session.subset!.includes(word.id)):words;}
export function paperAnswer(word:VocabularyWord,session:PaperSession){return paperWritesPortuguese(session)?paperPortuguese(word):word.translation;}
export function paperCue(word:VocabularyWord,session:PaperSession){return paperWritesPortuguese(session)?word.translation:paperPortuguese(word);}
export function paperInitialHint(text:string){return text.replace(/\p{L}[\p{L}’'-]*/gu,part=>Array.from(part).length>2?`${Array.from(part)[0]}…`:part);}
export function revealPaperHint(session:PaperSession,id:string):PaperSession{return {...session,hints:{...session.hints,[id]:session.hints[id]?2:1}};}
export function checkPaper(session:PaperSession):PaperSession{return {...session,phase:"check",marks:{...session.marks,...Object.fromEntries(Object.keys(session.hints).map(id=>[id,"repeat" as const]))}};}
export function markPaper(session:PaperSession,id:string,mark:"independent"|"repeat"):PaperSession{
  return mark==="independent"&&session.hints[id]?session:{...session,marks:{...session.marks,[id]:mark}};
}
export function paperDifficult(words:readonly VocabularyWord[],session:PaperSession){return paperRows(words,session).filter(word=>session.hints[word.id]||session.marks[word.id]==="repeat");}
export function paperChecked(words:readonly VocabularyWord[],session:PaperSession){const rows=paperRows(words,session);return rows.length>0&&rows.every(word=>!!session.marks[word.id]);}
export function repeatPaper(words:readonly VocabularyWord[],session:PaperSession):PaperSession{
  const difficult=paperDifficult(words,session);
  return difficult.length?{...session,phase:"recall",hints:{},marks:{},subset:difficult.map(word=>word.id),retry:true}:session;
}
export function nextPaperColumn(session:PaperSession):PaperSession{return {...newPaperSession(),phase:"recall",column:session.column===6?3:(session.column+1) as PaperColumn};}
