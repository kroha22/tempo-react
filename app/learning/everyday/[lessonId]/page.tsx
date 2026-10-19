import { notFound } from "next/navigation";
import { AppShell } from "@/features/app-shell/AppShell";
import { EverydayLesson } from "@/features/practice/EverydayLesson";

export default async function EverydayPage({params}:{params:Promise<{lessonId:string}>}) {
  const {lessonId}=await params;
  if(lessonId!=="likes"&&lessonId!=="body")notFound();
  return <AppShell current="learning"><EverydayLesson key={lessonId} lessonId={lessonId}/></AppShell>;
}
