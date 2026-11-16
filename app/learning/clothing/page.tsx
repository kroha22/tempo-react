"use client";
import {useRouter} from "next/navigation";
import {AppShell} from "@/features/app-shell/AppShell";
import {ClothingTopic} from "@/features/practice/ClothingTopic";
export default function ClothingPage(){const router=useRouter();return <AppShell current="learning"><ClothingTopic onBack={()=>router.push("/learning/plan")}/></AppShell>;}
