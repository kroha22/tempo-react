import {AppShell} from "@/features/app-shell/AppShell";
import {FoodCards} from "@/features/cards/saved-items/FoodCards";
export default async function FoodCardsPage({searchParams}:{searchParams:Promise<{topic?:string;mode?:string}>}){
  const params=await searchParams;
  return <AppShell current="learning"><FoodCards topic={params.topic} mode={params.mode}/></AppShell>;
}
