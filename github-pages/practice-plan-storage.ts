import { emptyPracticePlanProgress, parsePracticePlanProgress, type PracticePlanStorage } from "../features/practice/plan/model";

export const practicePlanStorageKey="tempo-react:github-pages:practice-plan:v1";
// Public static-demo adapter only. Route completion and SRS still belong to their APIs/D1.
export const browserPracticePlanStorage:PracticePlanStorage={
  load(){const raw=window.localStorage.getItem(practicePlanStorageKey);return raw===null?emptyPracticePlanProgress():parsePracticePlanProgress(JSON.parse(raw));},
  save(progress){window.localStorage.setItem(practicePlanStorageKey,JSON.stringify(progress));},
  subscribe(listener){const onStorage=(event:StorageEvent)=>{if(event.key===practicePlanStorageKey||event.key===null)listener();};window.addEventListener("storage",onStorage);return()=>window.removeEventListener("storage",onStorage);},
};
