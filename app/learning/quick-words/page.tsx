"use client";
import {AppShell} from "@/features/app-shell/AppShell";
import {QuickWords} from "@/features/practice/QuickWords";
import {useRouter} from "next/navigation";
export default function QuickWordsPage(){
  const router=useRouter();
  return <AppShell current="learning"><QuickWords onBack={()=>router.push("/learning")}/></AppShell>;
}
