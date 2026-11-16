"use client";
import {AppShell} from "@/features/app-shell/AppShell";
import {QuickWords} from "@/features/practice/QuickWords";
import {useRouter} from "next/navigation";
import {useSearchParams} from "next/navigation";
import {Suspense} from "react";
function WordPage(){
  const router=useRouter();
  const params=useSearchParams();
  return <AppShell current="learning"><QuickWords onBack={()=>router.push("/learning")} topicId={params.get("topic")??undefined}/></AppShell>;
}
export default function QuickWordsPage(){return <Suspense fallback={<p role="status">Открываем слова…</p>}><WordPage/></Suspense>;}
