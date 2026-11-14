import {AppShell} from "@/features/app-shell/AppShell";
import {BodyCards} from "@/features/cards/saved-items/BodyCards";
export default async function BodyCardsPage({searchParams}:{searchParams:Promise<{topic?:string;mode?:string;source?:string}>}){
  const params=await searchParams;
  return <AppShell current="learning"><BodyCards topic={params.topic} mode={params.mode} source={params.source}/></AppShell>;
}
