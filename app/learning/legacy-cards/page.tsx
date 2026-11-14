import {AppShell} from "@/features/app-shell/AppShell";
import {LegacyCards} from "@/features/cards/saved-items/LegacyCards";
export default async function LegacyCardsPage({searchParams}:{searchParams:Promise<{group?:string;mode?:string}>}){const params=await searchParams;return <AppShell current="learning"><LegacyCards group={params.group} mode={params.mode}/></AppShell>;}
