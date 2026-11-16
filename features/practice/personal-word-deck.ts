import {z} from "zod";
import {scheduleReviewProgress,type ReviewGrade,type ReviewProgress} from "../cards/scheduler.ts";
const text=z.string().min(1).max(600),timestamp=z.int().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const personalProgressSchema=z.strictObject({cardId:z.string().min(1).max(260),due:timestamp,interval:z.number().finite().min(0).max(36500),ease:z.number().min(1.3).max(3.2),repetitions:z.int().nonnegative(),lapses:z.int().nonnegative(),lastGrade:z.union([z.literal(0),z.literal(1),z.literal(2),z.literal(3),z.null()])});
export const personalWordSchema=z.strictObject({id:z.string().min(1).max(260),wordId:z.string().min(1).max(200),owner:z.enum(["word","legacy","study"]),targetId:z.string().min(1).max(200),front:text,back:text,addedAt:timestamp,updatedAt:timestamp,errors:z.int().nonnegative(),lastErrorAt:timestamp.nullable(),needsPractice:z.boolean(),sources:z.array(z.string().min(1).max(200)).max(100),receipts:z.array(z.string().max(100)).max(64),progress:personalProgressSchema.nullable()}).refine(row=>row.id===`${row.owner}:${row.targetId}`&&(!row.progress||row.owner==="word"&&row.progress.cardId===row.id));
export const personalDeckSchema=z.array(personalWordSchema).max(10000).refine(rows=>new Set(rows.map(row=>row.id)).size===rows.length);
export type PersonalWord=z.infer<typeof personalWordSchema>;
export type PersonalWordSeed=Pick<PersonalWord,"wordId"|"owner"|"targetId"|"front"|"back">;
export function enrollPersonalWord(rows:readonly PersonalWord[],seed:PersonalWordSeed,source:string,eventId:string,now:number,mistake=false):PersonalWord[]{
  const id=`${seed.owner}:${seed.targetId}`,old=rows.find(row=>row.id===id),seen=old?.receipts.includes(eventId);
  const row:PersonalWord={...seed,id,addedAt:old?.addedAt??now,updatedAt:Math.max(now,old?.updatedAt??0),errors:(old?.errors??0)+(mistake&&!seen?1:0),lastErrorAt:mistake?Math.max(now,old?.lastErrorAt??0):old?.lastErrorAt??null,needsPractice:mistake||old?.needsPractice||false,sources:[...new Set([...(old?.sources??[]),source])].slice(-100),receipts:seen?old!.receipts:[...(old?.receipts??[]),eventId].slice(-64),progress:old?.progress??null};
  return [...rows.filter(item=>item.id!==id),row];
}
export function ratePersonalWord(rows:readonly PersonalWord[],id:string,grade:ReviewGrade,now:number,prepared?:ReviewProgress):PersonalWord[]{
  return rows.map(row=>row.id===id?{...row,updatedAt:now,needsPractice:false,progress:row.owner==="word"?personalProgressSchema.parse(prepared??scheduleReviewProgress(row.id,row.progress??undefined,grade,now)):null}:row);
}
export function mergePersonalDeck(a:readonly PersonalWord[]=[],b:readonly PersonalWord[]=[]){
  const all=new Map(a.map(row=>[row.id,row]));for(const row of b){const old=all.get(row.id);if(!old){all.set(row.id,row);continue;}const newer=old.updatedAt>=row.updatedAt?old:row;all.set(row.id,{...newer,addedAt:Math.min(old.addedAt,row.addedAt),errors:Math.max(old.errors,row.errors),lastErrorAt:old.lastErrorAt===null?row.lastErrorAt:row.lastErrorAt===null?old.lastErrorAt:Math.max(old.lastErrorAt,row.lastErrorAt),sources:[...new Set([...old.sources,...row.sources])].slice(-100),receipts:[...new Set([...old.receipts,...row.receipts])].slice(-64)});}return [...all.values()];
}
