import { LegacyLessonLink as Link } from "./LegacyLessonLink";
import { pastSunLessons } from "../content/past-sun-lessons";
import { PastSunLesson } from "./PastSunLesson";
export function TrazerLesson() { return <><p><Link href="/learning/past-suns">☀ Все солнышки: FAZER, DIZER, IR, TRAZER</Link></p><PastSunLesson lesson={pastSunLessons.find(lesson => lesson.verb === "trazer")!} /></>; }
