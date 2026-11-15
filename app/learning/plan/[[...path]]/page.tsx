import {AppShell} from "@/features/app-shell/AppShell";
import {GeneralPlan} from "@/features/learning/plan/GeneralPlan";
import {PlanActivity} from "@/features/learning/plan/PlanActivity";
import {PlanWords} from "@/features/learning/plan/PlanWords";
import {PlanSchoolLesson} from "@/features/learning/plan/PlanSchoolLesson";
export default async function PlanPage({params,searchParams}:{params:Promise<{path?:string[]}>;searchParams:Promise<{unit?:string;words?:string}>}){
  const {path}=await params;
  const query=await searchParams;
  return <AppShell current="learning">{path?.[0]==="words"?<PlanWords/>:path?.[0]==="school"?<PlanSchoolLesson unitId={query.unit} wordsOnly={query.words==="1"}/>:path?.[0]==="step"&&path[1]?<PlanActivity id={path[1]}/>:<GeneralPlan/>}</AppShell>;
}
