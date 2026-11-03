import type { GrammarLesson, GrammarTask } from "./gramatica-ativa.ts";
export const mixedReviewSkills=[
  {unit:1,slug:"identity-and-origin",title:"SER",foundation:"ser",rows:[
    ["job","Выбери SER: A Leonor e a Inês ___ professoras.","são","Профессия двух людей: são professoras.",["estão","é"]],
    ["owner","Впиши SER: Estes livros ___ do Pedro.","são","Принадлежность нескольких предметов: são do Pedro."],
  ]},
  {unit:2,slug:"location-and-state",title:"ESTAR",foundation:"estar",rows:[
    ["where","Выбери ESTAR: Tu ___ na biblioteca.","estás","Местонахождение с tu: estás.",["és","está"]],
    ["state","Впиши ESTAR: Hoje os meus amigos ___ cansados.","estão","Состояние нескольких людей: estão cansados."],
  ]},
  {unit:3,slug:"identity-or-state",title:"SER / ESTAR",foundation:"ser-estar",rows:[
    ["place","Ужин как мероприятие проходит в ресторане: O jantar ___ no restaurante.","é","Место события выражает SER.",["está","estão"]],
    ["contrast","Впиши две формы: Os meus pais ___ médicos e hoje ___ em casa.","são estão","Профессия: são médicos; местонахождение: estão em casa."],
  ]},
  {unit:4,slug:"action-in-progress",title:"ESTAR A",foundation:"estar-a",rows:[
    ["observe","Сейчас Педру читает газету. Выбери фразу.","O Pedro está a ler o jornal.","Действие в процессе: está a + инфинитив.",["O Pedro está a lê o jornal.","O Pedro é a ler o jornal."]],
    ["produce","Впиши ESTAR A + TRABALHAR: Tu ___ neste momento.","estás a trabalhar","Tu estás a trabalhar — ты сейчас работаешь."],
  ]},
  {unit:5,slug:"everyday-ar",title:"Presente -AR",foundation:"present-ar",rows:[
    ["choose","Выбери FALAR: A Sofia ___ português todos os dias.","fala","Ela fala: окончание -a.",["falo","falam"]],
    ["produce","Впиши MORAR: Nós ___ perto da escola.","moramos","Nós moramos: окончание -amos."],
  ]},
  {unit:6,slug:"everyday-er",title:"Presente -ER",foundation:"present-er",rows:[
    ["choose","Выбери APRENDER: Tu ___ português aqui.","aprendes","Tu aprendes: окончание -es.",["aprende","aprendem"]],
    ["produce","Впиши ESCREVER: Eu ___ uma carta por semana.","escrevo","Eu escrevo: окончание -o."],
  ]},
  {unit:7,slug:"irregular-er-use",title:"Неправильные -ER",foundation:"present-er-irregular",rows:[
    ["choose","Выбери LER: Eu ___ o jornal de manhã.","leio","С eu: leio.",["leo","lê"]],
    ["produce","Впиши PODER: Eu não ___ ir hoje.","posso","Eu posso — я могу."],
  ]},
  {unit:8,slug:"ir-alternations",title:"-IR и чередования",foundation:"present-ir",rows:[
    ["choose","Выбери PARTIR: Os meus amigos ___ amanhã.","partem","Eles partem: окончание -em.",["partimos","partes"]],
    ["produce","Впиши SENTIR: Eu ___ frio aqui.","sinto","У sentir с eu: sinto, с чередованием e → i."],
  ]},
  {unit:9,slug:"movement-and-requests",title:"Особые -IR",foundation:"present-ir-special",rows:[
    ["choose","Выбери OUVIR: Eu ___ a professora.","ouço","В pt-PT: eu ouço.",["ouvo","ouve"]],
    ["produce","Впиши VIR: Eles ___ de autocarro todos os dias.","vêm","Eles vêm от VIR. У VER другая форма: veem."],
  ]},
  {unit:10,slug:"habit-and-current-action",title:"Обычно / сейчас",foundation:"habit-now",rows:[
    ["choose","Сейчас действие происходит на наших глазах: Neste momento, a Inês ___ o almoço.","está a preparar","Для наблюдаемого процесса: está a preparar.",["prepara habitualmente","preparou ontem"]],
    ["produce","Впиши две формы JANTAR: Habitualmente, eu ___ em casa; neste momento, eu ___ num restaurante. Во втором пропуске используй ESTAR A. Раздели ответы знаком ;.","janto; estou a jantar","Привычка: janto; действие сейчас: estou a jantar."],
  ]},
  {unit:11,slug:"possession-age-and-sensations",title:"TER",foundation:"ter",rows:[
    ["choose","Выбери TER: A Beatriz e o Luís ___ dois filhos.","têm","Два человека: têm, с циркумфлексом.",["tem","tens"]],
    ["produce","Впиши TER: Nós ___ sede depois do trabalho.","temos","Nós temos sede — мы хотим пить."],
  ]},
] as const;
const pairs:GrammarTask[]=mixedReviewSkills.flatMap(skill=>skill.rows.map(([key,prompt,answer,explanation,...rest],index)=>{
  const distractors=rest[0] as readonly string[]|undefined;
  const options=distractors?[answer,...distractors]:undefined;
  if(options)options.push(...options.splice(0,skill.unit%options.length));
  return {id:`exercise:ga1:review-foundations:exit:u${String(skill.unit).padStart(2,"0")}-${key}`,stage:"exit",prompt,answers:[answer],explanation,options,target:`grammar:ga1:${skill.slug}`,critical:index===1};
}));
const tasks=[...pairs.filter((_,i)=>i%2===0),...pairs.filter((_,i)=>i%2===1)];
export const mixedGrammarReview:GrammarLesson={id:"lesson:ga1:review-foundations",slug:"review-foundations",unit:11,checkpoint:true,
  title:"Смешанное повторение U01–U11",canDo:"Я могу применять 11 знакомых грамматических навыков в новых ситуациях.",
  rule:"По два задания на каждый навык. Чтобы отметить навык как подтверждённый в этой проверке, нужно верно выполнить оба задания, включая ввод ответа. Общий процент не заменяет результат по навыкам.",
  examples:[],vocabulary:[],review:[],tasks};
