import { z } from "zod";
import { localLearningSchema, mergeLocalLearning, type LearningStore } from "./local-learning-store";
import { parseProfileData, profileDataKey, type LocalProfile } from "./profiles";
import { mergePracticePlanProgress } from "../features/practice/plan/model";
import { deterministicReviewItemId } from "../features/learning/progress/contracts";

export const backupSchema = z.strictObject({
  format: z.literal("tempo-profile"), version: z.literal(1), exportedAt: z.int().positive(),
  profile: z.strictObject({id:z.string().regex(/^[a-zA-Z0-9-]{1,80}$/),name:z.string().trim().min(1).max(40),child:z.boolean(),avatar:z.string().optional()}),
  browser: z.unknown().transform(value=>parseProfileData(value)), learning: localLearningSchema,
}).superRefine((file,ctx)=>{
  const items=new Set(file.learning.items.map(row=>row.studyItemId));
  if(items.size!==file.learning.items.length||new Set(file.learning.reviews.map(row=>row.studyItemId)).size!==file.learning.reviews.length||new Set(file.learning.progress.map(row=>row.lessonId)).size!==file.learning.progress.length||new Set(file.learning.events.map(row=>row.clientEventId)).size!==file.learning.events.length||file.learning.sources.some(row=>!items.has(row.studyItemId))||file.learning.reviews.some(row=>!items.has(row.studyItemId)||row.reviewItemId!==deterministicReviewItemId(row.studyItemId)))ctx.addIssue({code:"custom",message:"Inconsistent backup references"});
});
export type ProfileBackup = z.infer<typeof backupSchema>;
export function parseBackup(text:string):ProfileBackup {
  if(new TextEncoder().encode(text).length>10*1024*1024)throw new Error("Файл больше 10 МБ");
  return backupSchema.parse(JSON.parse(text));
}
export async function exportProfile(profile:LocalProfile,store:LearningStore):Promise<ProfileBackup>{
  const learning=await store.read();
  return backupSchema.parse({format:"tempo-profile",version:1,exportedAt:Date.now(),profile,browser:JSON.parse(localStorage.getItem(profileDataKey(profile.id))??"null"),learning});
}
export function mergeBrowserData(a:ReturnType<typeof parseProfileData>,b:ReturnType<typeof parseProfileData>){
  const cards=new Map(a.cards.map(row=>[row.cardId,row]));
  // Legacy reviews have no modification time. Keep existing schedules on collisions.
  for(const row of b.cards)if(!cards.has(row.cardId))cards.set(row.cardId,row);
  const activities={...a.learning.activities};
  for(const [id,row] of Object.entries(b.learning.activities??{})){
    const old=activities[id];
    if(!old||row.correct/row.total>old.correct/old.total)activities[id]=row;
  }
  const learning={...a.learning,activities,lastTopicId:a.learning.lastTopicId??b.learning.lastTopicId,feelings:{...a.learning.feelings,viewed:[...new Set([...a.learning.feelings.viewed,...b.learning.feelings.viewed])],practised:a.learning.feelings.practised||b.learning.feelings.practised,repeated:a.learning.feelings.repeated||b.learning.feelings.repeated}};
  return parseProfileData({version:1,plan:mergePracticePlanProgress(a.plan,b.plan),cards:[...cards.values()],learning});
}
const pendingKey=(id:string)=>`tempo-react:pending-import:${id}:v1`;
export async function importProfile(profileId:string,store:LearningStore,file:ProfileBackup){
  const valid=backupSchema.parse(file);
  // Write-ahead journal: a quota/error between the two stores is recoverable and idempotent.
  localStorage.setItem(pendingKey(profileId),JSON.stringify(valid));
  await finishImport(profileId,store,valid);
}
async function finishImport(profileId:string,store:LearningStore,file:ProfileBackup){
  await store.update(data=>mergeLocalLearning(data,file.learning));
  const current=parseProfileData(JSON.parse(localStorage.getItem(profileDataKey(profileId))??"null"));
  localStorage.setItem(profileDataKey(profileId),JSON.stringify(mergeBrowserData(current,file.browser)));
  localStorage.removeItem(pendingKey(profileId));
}
export async function recoverImport(profileId:string,store:LearningStore){
  const raw=localStorage.getItem(pendingKey(profileId));
  if(raw!==null)await finishImport(profileId,store,parseBackup(raw));
}
