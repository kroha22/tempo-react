import {preparationUnits} from "../../content/test-preparation";
import {schoolLessonSections} from "../../content/permanent-preparation-lessons";
import {navigationTopics,topicForLegacyId} from "../../content/topic-navigation";
export const schoolLessonHref=(id:string,words=false)=>`/learning/plan/school?unit=${encodeURIComponent(id)}${words?"&words=1":""}`;
export const schoolPlanGroups=[...navigationTopics.filter(topic=>topic.schoolUnitIds.length).map(topic=>({topic,title:topic.title,units:preparationUnits.filter(unit=>(topic.schoolUnitIds as readonly string[]).includes(unit.id))})),...schoolLessonSections.filter(section=>!topicForLegacyId(section.topicId)).map(section=>({topic:undefined,title:section.title,units:preparationUnits.filter(unit=>(section.unitIds as readonly string[]).includes(unit.id))}))];
