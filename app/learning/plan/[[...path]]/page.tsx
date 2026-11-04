import {AppShell} from "@/features/app-shell/AppShell";
import {GeneralPlan} from "@/features/learning/plan/GeneralPlan";
import {PlanActivity} from "@/features/learning/plan/PlanActivity";
export default async function PlanPage({params}:{params:Promise<{path?:string[]}>}){
  const {path}=await params;
  return <AppShell current="learning">{path?.[0]==="step"&&path[1]?<PlanActivity id={path[1]}/>:<GeneralPlan/>}</AppShell>;
}
