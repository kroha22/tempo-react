import {grammarGlossaryRows,grammarReadingGlossary} from "./grammar-reading.ts";
import {gramaticaVocabulary} from "./gramatica-vocabulary.ts";
import type {Chunk,Example,StudyItem} from "./types.ts";

export type ReadingCardChoice={studyItemId:string;pt:string;ru:string};
const normalize=(text:string)=>text.normalize("NFC").toLocaleLowerCase("pt-PT");
const choices=new Map<string,ReadingCardChoice[]>();
for(const entry of gramaticaVocabulary)for(const form of entry.forms){
  const key=normalize(form),rows=choices.get(key)??[];
  if(!rows.some(row=>row.studyItemId===entry.studyItemId))rows.push({studyItemId:entry.studyItemId,pt:entry.lemma,ru:entry.translation});
  choices.set(key,rows);
}
export const readingChunks:Chunk[]=[];
export const readingExamples:Example[]=[];
export const readingStudyItems:StudyItem[]=[];
export const readingRu:Record<string,string>={};
const base={schemaVersion:1,contentRevision:1,status:"reviewed" as const};
for(const [forms,ru] of grammarGlossaryRows){
  const aliases=forms.split(",");
  // Context matters: presente here is a tense, not the existing noun “gift”.
  const existing=[...new Map(aliases.flatMap(form=>choices.get(normalize(form))??[]).filter(row=>forms!=="presente"&&(forms!=="ouvimos,ouvir"||row.studyItemId==="study:ga1:verb:ouvir:hear")).map(row=>[row.studyItemId,row])).values()];
  let rows=existing;
  if(!rows.length){
    const pt=aliases[0];
    // Identity is the published glossary group, independent of lesson or translated copy.
    const slug=pt.normalize("NFD").replace(/\p{M}/gu,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
    const studyItemId=`study:reading:${slug}`,chunkId=`chunk:reading:${slug}`,exampleId=`example:reading:${slug}`,translationKey=`reading.${slug}.ru`;
    if(readingStudyItems.some(item=>item.id===studyItemId))throw new Error(`Duplicate reading identity: ${slug}`);
    readingRu[translationKey]=ru;
    // A quoted reading fragment, not an inferred noun paradigm or conjugated verb lexeme.
    readingChunks.push({...base,id:chunkId,kind:"chunk",text:pt,normalizedText:normalize(pt),glossKey:translationKey,register:"neutral",exampleIds:[exampleId]});
    readingExamples.push({...base,id:exampleId,kind:"example",locale:"pt-PT",text:pt,normalizedText:normalize(pt),translationKey,targetIds:[studyItemId],difficulty:"entry",presentationProfileIds:["adult"],quality:{ptPtReviewed:true,translationReviewedLocales:["ru"],naturalness:"acceptable",synthetic:true}});
    readingStudyItems.push({...base,id:studyItemId,kind:"study-item",target:{type:"chunk",chunkId},display:{type:"chunk",text:pt,translationKey},defaultExampleId:exampleId,cardEligible:true});
    rows=[{studyItemId,pt,ru}];
  }
  for(const form of aliases)choices.set(normalize(form),rows);
}
/** Ambiguous vocabulary keeps separate meanings; the learner chooses explicitly. */
export function readingCardChoices(pt:string):readonly ReadingCardChoice[]{
  const key=normalize(pt);
  return Object.hasOwn(grammarReadingGlossary,key)?choices.get(key)??[]:[];
}
