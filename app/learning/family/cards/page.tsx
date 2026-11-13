import {AppShell} from "@/features/app-shell/AppShell";
import {FamilyCards} from "@/features/cards/saved-items/FamilyCards";
export default async function FamilyCardsPage({searchParams}:{searchParams:Promise<{topic?:string;mode?:string}>}){
  const params=await searchParams;
  return <AppShell current="learning"><FamilyCards topic={params.topic} mode={params.mode}/></AppShell>;
}
