"use client";
import {useRouter} from "next/navigation";
import {AppShell} from "@/features/app-shell/AppShell";
import {IntroductionTopic} from "@/features/practice/IntroductionTopic";
export default function IntroductionPage(){const router=useRouter();return <AppShell current="learning"><IntroductionTopic onBack={()=>router.push("/learning/plan")}/></AppShell>;}
