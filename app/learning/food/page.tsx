import {AppShell} from "@/features/app-shell/AppShell";
import {FoodFlow} from "@/features/practice/FoodFlow";
export default async function FoodPage({searchParams}:{searchParams:Promise<{topic?:string;phase?:string}>}){
  const params=await searchParams;
  return <AppShell current="learning"><FoodFlow topic={params.topic} phase={params.phase}/></AppShell>;
}
