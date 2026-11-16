import {z} from "zod";
export const wordSessionSchema=z.strictObject({
  setId:z.string().min(1).max(200),stage:z.enum(["cards","choice","training"]),
  index:z.int().min(0).max(2000),viewed:z.array(z.string().min(1).max(200)).max(1000),
  mode:z.enum(["pairs","writing","search","letters","listening","placement","dictation","builder","sequence"]),updatedAt:z.int().nonnegative(),
});
export type WordLearningSession=z.infer<typeof wordSessionSchema>;
// Called only by player event handlers when persisting continuation.
export function wordSessionTimestamp(){return Date.now();}
export function wordRoundRanges(total:number){
  const count=Math.max(1,Math.ceil(total/6));
  return Array.from({length:count},(_,index)=>({start:Math.floor(index*total/count),end:Math.floor((index+1)*total/count)}));
}
