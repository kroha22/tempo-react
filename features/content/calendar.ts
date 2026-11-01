import type {VocabularyGroup,VocabularyWord} from "./vocabulary-model.ts";
import type {UsageModule} from "./learning-model.ts";
import {calendarPortuguese} from "./calendar-language.ts";

export const calendarDays=[
  ["segunda-feira","понедельник"],["terça-feira","вторник"],["quarta-feira","среда"],["quinta-feira","четверг"],["sexta-feira","пятница"],["sábado","суббота"],["domingo","воскресенье"],
] as const;
export const calendarMonths=[
  ["janeiro","январь"],["fevereiro","февраль"],["março","март"],["abril","апрель"],["maio","май"],["junho","июнь"],
  ["julho","июль"],["agosto","август"],["setembro","сентябрь"],["outubro","октябрь"],["novembro","ноябрь"],["dezembro","декабрь"],
] as const;
const word=(label:string,translation:string):VocabularyWord=>({id:`vocabulary:calendar:${label}`,label,translation});
export const calendarWords:VocabularyWord[]=[...calendarDays,...calendarMonths].map(([pt,ru])=>word(pt,ru));
export const calendarGroup:VocabularyGroup={id:"vocabulary-calendar",title:"Время и календарь",subgroups:[
  {id:"calendar-week",title:"Дни недели",sets:[{id:"calendar-week",title:"Дни недели",words:calendarDays.map(([pt])=>word(pt,"").id)}]},
  ...[0,6].map((start,index)=>({id:`calendar-months-${index+1}`,title:index===0?"Январь — июнь":"Июль — декабрь",sets:[{id:`calendar-months-${index+1}`,title:index===0?"Январь — июнь":"Июль — декабрь",words:calendarMonths.slice(start,start+6).map(([pt])=>word(pt,"").id)}]})),
]};

export const calendarLessons=[
  {id:"week",title:"A semana — Неделя",child:"Собери неделю: после пятницы наступает суббота. Найди день для следующей встречи.",adult:"Назови день недели и договорись о встрече.",explanation:"Дни недели пишем со строчной буквы. Hoje é segunda-feira — сегодня понедельник. Na segunda-feira — в понедельник; à segunda-feira — по понедельникам. Здесь сначала тренируем названия дней.",rows:calendarDays,collectionIds:["collection:calendar-week"],tasks:[
    ["Сегодня вторник.","Hoje é ","terça-feira","segunda-feira","quinta-feira","."],
    ["После пятницы наступает…","Depois de sexta-feira vem ","sábado","domingo","quarta-feira","."],
    ["Встреча в воскресенье.","O encontro é no ","domingo","sábado","segunda-feira","."],
  ]},
  {id:"months-first",title:"Janeiro–junho — Первая половина года",child:"У года двенадцать месяцев. Начнём с первых шести: найди месяц на календаре.",adult:"Назови месяц и прочитай дату в календаре. Начнём с января–июня.",explanation:"Названия месяцев тоже пишем со строчной буквы. Em maio — в мае. В апреле и июне 30 дней, в январе, марте и мае — 31. В феврале 28, а в високосном году 29.",rows:calendarMonths.slice(0,6),collectionIds:["collection:calendar-months-1"],tasks:[
    ["Первый месяц года.","O primeiro mês é ","janeiro","março","junho","."],
    ["После марта наступает…","Depois de março vem ","abril","fevereiro","maio","."],
    ["День рождения в июне.","O aniversário é em ","junho","janeiro","abril","."],
  ]},
  {id:"months-last",title:"Julho–dezembro — Вторая половина года",child:"Продолжим календарь: ещё шесть месяцев до конца года.",adult:"Назови месяцы второй половины года и месяц события.",explanation:"В июле, августе, октябре и декабре 31 день; в сентябре и ноябре — 30. Em setembro — в сентябре. Для месяца используем em, без артикля.",rows:calendarMonths.slice(6),collectionIds:["collection:calendar-months-2"],tasks:[
    ["После сентября наступает…","Depois de setembro vem ","outubro","agosto","dezembro","."],
    ["Последний месяц года.","O último mês é ","dezembro","julho","novembro","."],
    ["Встреча в августе.","O encontro é em ","agosto","setembro","outubro","."],
  ]},
  {id:"dates",title:"A data — Дата",child:"Прочитай приглашение: в какой день приходить? Дата — это день, месяц и иногда год.",adult:"Прочитай дату и уточни день встречи. Например, 05/10/2026: сначала день, затем месяц, затем год.",explanation:"Que dia é hoje? — Какое сегодня число? Hoje é dia cinco de outubro — сегодня пятое октября. Между числом и месяцем ставим de. Для события: no dia cinco de outubro — пятого октября. 2026 читается dois mil e vinte e seis. Не путай em outubro (в октябре) и no dia cinco de outubro (пятого октября).",rows:[],collectionIds:["collection:calendar-months-1","collection:calendar-months-2"],tasks:[
    ["Дата 05/10: пятое октября.","Hoje é dia cinco de ","outubro","maio","dezembro","."],
    ["Встреча 12/06: двенадцатого июня.","O encontro é no dia doze de ","junho","julho","fevereiro","."],
    ["Приглашение на 03/09: третье сентября.","A festa é no dia três de ","setembro","março","novembro","."],
  ]},
] as const;

export function buildCalendarUsage(meaningFor:(id:string)=>string):UsageModule[]{
  const prompts={week:["Hoje é terça-feira. Completa a frase.","Que dia vem depois de sexta-feira?","O encontro é no domingo. Completa a frase."],"months-first":["Qual é o primeiro mês do ano?","Que mês vem depois de março?","O aniversário é em junho. Completa a frase."],"months-last":["Que mês vem depois de setembro?","Qual é o último mês do ano?","O encontro é em agosto. Completa a frase."],dates:["Hoje é dia 05/10. Completa a data.","O encontro é no dia 12/06. Completa a data.","A festa é no dia 03/09. Completa a data."]} as const;
  const examples={week:["Hoje é segunda-feira.","Сегодня понедельник.","segunda-feira"],"months-first":["O encontro é em maio.","Встреча в мае.","maio"],"months-last":["O aniversário é em novembro.","День рождения в ноябре.","novembro"],dates:["A festa é no dia oito de abril.","Праздник восьмого апреля.","abril"]} as const;
  return calendarLessons.map(lesson=>({
    id:`usage:calendar:${lesson.id}`,title:lesson.title,situation:"Прочитай условие и дополни фразу. Порядок ответов меняется; ориентируйся на смысл.",collectionIds:[...lesson.collectionIds],
    newMeaningIds:lesson.rows.map(([pt])=>meaningFor(word(pt,"").id)),reviewedMeaningIds:lesson.id==="dates"?calendarMonths.map(([pt])=>meaningFor(word(pt,"").id)):[],recognitionOnly:["hoje","depois de","vem","o encontro","o aniversário","a festa","primeiro","último","dia","cinco","doze","três"],
    examples:[{id:`example:calendar:${lesson.id}:0`,portuguese:examples[lesson.id][0],translation:examples[lesson.id][1],meaningIds:[meaningFor(word(examples[lesson.id][2],"").id)],grammarTopicIds:[]}],
    exercises:lesson.tasks.map(([prompt,before,answer,other,third,after],i)=>({id:`cloze:calendar:${lesson.id}:${i}`,prompt:prompts[lesson.id][i],promptTranslation:prompt,before,after,correctOptionId:answer,feedback:calendarPortuguese[lesson.id].feedback[i],options:[answer,other,third].map((text,j,all)=>all[(j+i+1)%all.length]).map(text=>({id:text,text,meaningId:meaningFor(word(text,"").id)}))})),relatedLinks:[],
  }));
}
