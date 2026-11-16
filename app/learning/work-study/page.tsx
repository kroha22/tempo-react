"use client";
import {useRouter} from "next/navigation";
import {AppShell} from "@/features/app-shell/AppShell";
import {WorkStudyTopic} from "@/features/practice/WorkStudyTopic";
export default function WorkStudyPage(){const router=useRouter();return <AppShell current="learning"><WorkStudyTopic onBack={()=>router.push("/learning/plan")}/></AppShell>;}
