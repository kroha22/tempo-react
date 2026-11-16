/** Navigation only. These IDs already exist; this is not a content/progress registry. */
import {readingLessonIds} from "./reading-lessons";
export const navigationTopics=[
  {id:"topic:reading",title:"Буквы и чтение",description:"Алфавит · звуки · сочетания букв",href:"/learning/reading",
    legacyEntries:[{id:"topic:reading",title:"Буквы и чтение"}],
    schoolUnitIds:readingLessonIds,supplementalStepIds:[],wordSources:["school:words:reading"]},
  {id:"topic:vocabulary-family",title:"Моя семья и близкие",description:"Близкие · родственники · рассказ о семье",href:"/learning/family?topic=close&phase=explanation",
    legacyEntries:[{id:"topic:vocabulary-family",title:"Семья и друзья: прежние упражнения"}],
    schoolUnitIds:[],supplementalStepIds:["practice:words:expansion-family-close","practice:words:expansion-family-relatives"],
    wordSources:["topic:vocabulary-family"]},
  {id:"topic:food",title:"Еда и предпочтения",description:"Фрукты · продукты · GOSTAR DE",href:"/learning/food?topic=fruit&phase=explanation",
    legacyEntries:[{id:"topic:food",title:"Еда: прежние наборы и упражнения"}],
    schoolUnitIds:[],supplementalStepIds:["practice:words:expansion-food-fruit","practice:words:expansion-food-meals","practice:words:expansion-food-table","practice:everyday:likes"],
    wordSources:["topic:food","collection:expansion-food-meals","collection:pairs-verbs-food-shopping"]},
  {id:"topic:vocabulary-calendar",title:"Время и мой день",description:"Часы · календарь · распорядок · порядок событий",href:"/learning/time-day?topic=hours&phase=explanation",
    legacyEntries:[{id:"topic:vocabulary-calendar",title:"Календарь: прежние упражнения"},{id:"topic:vocabulary-my-day",title:"Распорядок: прежние упражнения"},{id:"topic:school-ordinals",title:"Порядковые числительные"},{id:"topic:school-timeline",title:"Линия времени"}],
    schoolUnitIds:["hours","months","ordinals-first","ordinals-last","timeline"],supplementalStepIds:[],
    wordSources:["topic:vocabulary-calendar","topic:vocabulary-my-day","school:words:time"]},
  {id:"topic:vocabulary-body",title:"Тело и здоровье",description:"Части тела · самочувствие · органы · привычки",href:"/learning/body?topic=face&phase=explanation",
    legacyEntries:[{id:"topic:vocabulary-body",title:"Тело: схемы и прежние упражнения"},{id:"topic:people",title:"Чувства и состояния"},{id:"topic:health",title:"Здоровье: слова и действия"},{id:"topic:school-health",title:"Здоровье и привычки"}],
    schoolUnitIds:["bones","organs","prevention","wellbeing"],supplementalStepIds:["practice:words:expansion-body-face","practice:words:expansion-body-movement","practice:everyday:body"],
    wordSources:["topic:vocabulary-body","topic:people","topic:health","collection:pairs-verbs-feelings","school:words:body","school:words:health"]},
  {id:"topic:vocabulary-house",title:"Дом и расположение",description:"Комнаты · предметы · положение · направления",href:"/learning/home?topic=rooms&phase=explanation",
    legacyEntries:[{id:"topic:vocabulary-house",title:"Дом: прежние наборы и полная схема"},{id:"topic:vocabulary-space",title:"Пространство и направления"}],
    schoolUnitIds:[],supplementalStepIds:[],
    wordSources:["topic:vocabulary-house","topic:vocabulary-space","collection:pairs-familiar-objects","collection:pairs-location"]},
] as const;
export type NavigationTopic=typeof navigationTopics[number];
export type NavigationTopicId=NavigationTopic["id"];
export const navigationTopic=(id?:string|null)=>navigationTopics.find(topic=>topic.id===id);
export const topicForLegacyId=(id:string)=>navigationTopics.find(topic=>topic.id===id||topic.legacyEntries.some(entry=>entry.id===id));
export const topicWordsHref=(id:NavigationTopicId)=>`/learning/quick-words?topic=${encodeURIComponent(id)}`;
type WordSetReference={id:string;aliases:readonly string[]};
export const topicForWordSet=(set:WordSetReference)=>navigationTopics.find(topic=>topic.wordSources.some(source=>source===set.id||set.aliases.includes(source)));
/** Keep the original set objects and their order within each group. Never merge words. */
export function groupTopicWordSets<T extends WordSetReference>(sets:readonly T[]){
  return [...navigationTopics.map(topic=>({id:topic.id,title:topic.title,sets:sets.filter(set=>topicForWordSet(set)?.id===topic.id)})),{id:"other",title:"Другие подборки",sets:sets.filter(set=>!topicForWordSet(set))}].filter(group=>group.sets.length);
}
