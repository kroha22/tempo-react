import {preparationUnits} from "../../content/test-preparation";
import {readingLessonIds} from "../../content/reading-lessons";
import {schoolLessonSections} from "../../content/permanent-preparation-lessons";
import {navigationTopics,topicForLegacyId} from "../../content/topic-navigation";
export const schoolLessonHref=(id:string,words=false)=>`/learning/plan/school?unit=${encodeURIComponent(id)}${words?"&words=1":""}`;
export const schoolPlanGroups=[{title:"Буквы и чтение",units:preparationUnits.filter(unit=>(readingLessonIds as readonly string[]).includes(unit.id))},...navigationTopics.filter(topic=>topic.schoolUnitIds.length).map(topic=>({title:topic.title,units:preparationUnits.filter(unit=>(topic.schoolUnitIds as readonly string[]).includes(unit.id))})),...schoolLessonSections.filter(section=>!topicForLegacyId(section.topicId)).map(section=>({title:section.title,units:preparationUnits.filter(unit=>(section.unitIds as readonly string[]).includes(unit.id))}))];
