"use client";
import {useRouter,useSearchParams} from "next/navigation";
import {AppShell} from "@/features/app-shell/AppShell";
import {IntroductionTopic} from "@/features/practice/IntroductionTopic";
export default function IntroductionPage(){const router=useRouter(),params=useSearchParams();return <AppShell current="learning"><IntroductionTopic phase={params.get("phase")??undefined} familyBridge={params.get("activity")==="family"} onBack={()=>router.push("/learning/plan")}/></AppShell>;}
