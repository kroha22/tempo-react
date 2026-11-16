"use client";
import {useRouter} from "next/navigation";
import {AppShell} from "@/features/app-shell/AppShell";
import {CityTopic} from "@/features/practice/CityTopic";
export default function CityPage(){const router=useRouter();return <AppShell current="learning"><CityTopic onBack={()=>router.push("/learning/plan")}/></AppShell>;}
