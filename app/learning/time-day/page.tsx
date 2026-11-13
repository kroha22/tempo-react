import {AppShell} from "@/features/app-shell/AppShell";
import {TimeDayFlow} from "@/features/practice/TimeDayFlow";
export default async function TimeDayPage({searchParams}:{searchParams:Promise<{topic?:string;phase?:string}>}){
  const params=await searchParams;
  return <AppShell current="learning"><TimeDayFlow topic={params.topic} phase={params.phase}/></AppShell>;
}
