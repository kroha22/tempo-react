import {AppShell} from "@/features/app-shell/AppShell";
import {FamilyFlow} from "@/features/practice/FamilyFlow";
export default async function FamilyPage({searchParams}:{searchParams:Promise<{topic?:string;phase?:string}>}){
  const params=await searchParams;
  return <AppShell current="learning"><FamilyFlow topic={params.topic} phase={params.phase}/></AppShell>;
}
