import {preparationUnits} from "../../content/test-preparation";
import {readingLessonIds} from "../../content/reading-lessons";
import {schoolLessonSections} from "../../content/permanent-preparation-lessons";
export const schoolLessonHref=(id:string,words=false)=>`/learning/plan/school?unit=${encodeURIComponent(id)}${words?"&words=1":""}`;
export const schoolPlanGroups=[{title:"Буквы и чтение",units:preparationUnits.filter(unit=>(readingLessonIds as readonly string[]).includes(unit.id))},...schoolLessonSections.map(section=>({title:section.title,units:preparationUnits.filter(unit=>(section.unitIds as readonly string[]).includes(unit.id))}))];
