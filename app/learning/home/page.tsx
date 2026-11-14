import {AppShell} from "@/features/app-shell/AppShell";
import {HomeFlow} from "@/features/practice/HomeFlow";
export default async function HomePage({searchParams}:{searchParams:Promise<{topic?:string;phase?:string}>}){
  const params=await searchParams;
  return <AppShell current="learning"><HomeFlow topic={params.topic} phase={params.phase}/></AppShell>;
}
