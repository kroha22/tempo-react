import {AppShell} from "@/features/app-shell/AppShell";
import {HomeCards} from "@/features/cards/saved-items/HomeCards";
export default async function HomeCardsPage({searchParams}:{searchParams:Promise<{topic?:string;mode?:string;source?:string}>}){
  const params=await searchParams;
  return <AppShell current="learning"><HomeCards topic={params.topic} mode={params.mode} source={params.source}/></AppShell>;
}
