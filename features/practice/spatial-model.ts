import type {DictationTask,GridPoint,PlacementTask,SpatialObject,SpatialPlace} from "../content/spatial-practice.ts";
export type Placements=Partial<Record<SpatialObject,SpatialPlace>>;
export function placeObject(state:Placements,object:SpatialObject,place:SpatialPlace):Placements{
  return {...Object.fromEntries(Object.entries(state).filter(([id,position])=>id!==object&&position!==place)),[object]:place};
}
export function placementCorrect(task:PlacementTask,state:Placements){return task.places.includes(state[task.object] as SpatialPlace);}
export function expectedTrace(task:DictationTask):GridPoint[]{
  const path=[task.start];for(const command of task.commands)for(let n=0;n<command.count;n++){const last=path.at(-1)!;const delta={right:[1,0],left:[-1,0],up:[0,-1],down:[0,1]}[command.direction];path.push({x:last.x+delta[0],y:last.y+delta[1]});}return path;
}
export function appendTrace(path:readonly GridPoint[],point:GridPoint,size:number):GridPoint[]{
  const last=path.at(-1);if(!last||point.x<0||point.y<0||point.x>=size||point.y>=size||Math.abs(last.x-point.x)+Math.abs(last.y-point.y)!==1)return [...path];return [...path,point];
}
export function checkTrace(task:DictationTask,path:readonly GridPoint[]){
  const target=expectedTrace(task);const mismatch=path.findIndex((p,i)=>!target[i]||p.x!==target[i].x||p.y!==target[i].y);
  return {correct:mismatch===-1&&path.length===target.length,mismatch:mismatch<0?path.length:mismatch,reason:mismatch>=0?(path.length>target.length?"long":"direction"):path.length<target.length?"short":"complete"} as const;
}
