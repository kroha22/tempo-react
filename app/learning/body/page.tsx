import {AppShell} from "@/features/app-shell/AppShell";
import {BodyFlow} from "@/features/practice/BodyFlow";
export default async function BodyPage({searchParams}:{searchParams:Promise<{topic?:string;phase?:string}>}){
  const params=await searchParams;
  return <AppShell current="learning"><BodyFlow topic={params.topic} phase={params.phase}/></AppShell>;
}
