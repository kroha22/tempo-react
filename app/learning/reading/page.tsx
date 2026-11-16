"use client";
import {useRouter} from "next/navigation";
import {ReadingLessons} from "@/features/practice/ReadingLessons";
import {AppShell} from "@/features/app-shell/AppShell";
export default function ReadingPage(){const router=useRouter();return <AppShell current="learning"><ReadingLessons onBack={()=>router.push("/learning/plan")}/></AppShell>;}
