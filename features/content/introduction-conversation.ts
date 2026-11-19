/** Authored practice only: positions below are never activity or progress IDs. */
export type ConversationTurn={title:string;cue:string;prompt:string;answer:string;accepted:readonly string[];hint:string;prefix:string;feedback:string;relatedHref:string;courtesy?:readonly string[];optional?:readonly string[]};
export type ConversationScenario={role:string;turns:readonly ConversationTurn[]};
const greetings="/learning/introduction?phase=explanation";
const ser="/learning/gramatica-ativa/identity-and-origin/explanation";
function scenario(evening:boolean):ConversationScenario{
  const name=evening?"Miguel":"Rita",other=evening?"Rita":"Rui",origin=evening?"do Brasil":"de França",thanks=evening?"obrigado":"obrigada",otherThanks=evening?"obrigada":"obrigado",hello=evening?"Boa noite":"Bom dia";
  return {role:`${evening?"Вечер":"Утро"}. Вы — ${evening?"Мигел из Бразилии":"Рита из Франции"}. Новый знакомый — ${evening?"женщина":"мужчина"}. Вы оба чувствуете себя хорошо. Следующая встреча завтра.`,turns:[
    {title:"Поздороваться",cue:`${hello}!`,prompt:`Ответьте ${evening?"вечерним":"утренним"} приветствием.`,answer:`${hello}!`,accepted:[`${hello}!`,`Olá! ${hello}!`,`Olá, ${hello.toLocaleLowerCase("pt-PT")}!`],hint:evening?"Сейчас вечер.":"Сейчас утро.",prefix:evening?"Boa…":"Bom…",feedback:"Вспомните приветствие по времени суток.",relatedHref:greetings},
    {title:"Узнать имя",cue:"",prompt:"Узнайте имя нового знакомого. Обращаемся на «ты».",answer:"Como te chamas?",accepted:["Como te chamas?","Como é que te chamas?"],hint:"Нужно узнать имя, а не состояние.",prefix:"Como te…",feedback:"Для имени нужна формула с chamar-se, а не вопрос о самочувствии.",relatedHref:greetings},
    {title:"Представиться",cue:`Chamo-me ${other}. E tu?`,prompt:`Ответьте от лица ${evening?"Мигела":"Риты"}.`,answer:`Chamo-me ${name}.`,accepted:[`Chamo-me ${name}.`,`Eu chamo-me ${name}.`,`Chamo-me ${name}. Muito prazer.`],hint:"Вспомните готовую формулу представления.",prefix:"Chamo-me…",feedback:"Назовите имя вашей роли с формулой Chamo-me.",relatedHref:greetings},
    {title:"Узнать происхождение",cue:"",prompt:"Спросите, откуда собеседник. Обращаемся на «ты».",answer:"De onde és?",accepted:["De onde és?","De onde é que és?"],hint:"Спрашиваем о происхождении, а не о месте сейчас.",prefix:"De onde…",feedback:"Здесь нужен вопрос о происхождении с SER.",relatedHref:ser},
    {title:"Рассказать, откуда вы",cue:"Sou de Portugal. E tu?",prompt:"Ответьте по стране вашей роли.",answer:`Sou ${origin}.`,accepted:[`Sou ${origin}.`,`Eu sou ${origin}.`],hint:"Происхождение передаём SER.",prefix:"Sou…",feedback:"Для происхождения нужен SER и страна вашей роли.",relatedHref:ser},
    {title:"Спросить о состоянии",cue:"",prompt:"Спросите, как собеседник себя чувствует. Обращаемся на «ты».",answer:"Como estás?",accepted:["Como estás?","Como é que estás?"],hint:"Сейчас спрашиваем о самочувствии.",prefix:"Como…",feedback:"Это вопрос о состоянии с ESTAR, а не об имени.",relatedHref:greetings},
    {title:"Ответить о состоянии",cue:`Estou bem, ${otherThanks}. E tu?`,prompt:"Скажите, что всё хорошо. Можно поблагодарить.",answer:`Estou bem, ${thanks}.`,accepted:[`Estou bem, ${thanks}.`,`Estou bem. ${thanks}.`,`Eu estou bem, ${thanks}.`,"Estou bem."],optional:["Estou bem."],courtesy:[`Estou bem, ${otherThanks}.`,`Eu estou bem, ${otherThanks}.`],hint:"Состояние сейчас: ESTAR. Благодарность согласуется с говорящим.",prefix:"Estou…",feedback:"Состояние передаём ESTAR: проверьте конструкцию, затем форму.",relatedHref:greetings},
    {title:"Попрощаться",cue:"",prompt:"Попрощайтесь с уточнением: увидитесь завтра.",answer:"Até amanhã!",accepted:["Até amanhã!","Até amanhã. Adeus!","Adeus, até amanhã!"],hint:"Следующая встреча завтра.",prefix:"Até…",feedback:"В прощании нужно уточнить, что встретитесь завтра.",relatedHref:greetings},
  ]};
}
export const introductionConversations:readonly ConversationScenario[]=[scenario(false),scenario(true)];
export const normalizeConversation=(value:string)=>value.normalize("NFC").toLocaleLowerCase("pt-PT").replace(/[.,!?]/g," ").trim().replace(/\s+/g," ");
const spelling=(value:string)=>normalizeConversation(value).normalize("NFD").replace(/\p{M}/gu,"").replace(/[-\s]/g,"");
export type ConversationCheck={accepted:boolean;kind:"correct"|"courtesy"|"writing"|"meaning"|"form";message:string};
export function checkConversation(turn:ConversationTurn,value:string):ConversationCheck{
  const answer=normalizeConversation(value),matches=(values:readonly string[])=>values.some(item=>normalizeConversation(item)===answer);
  if(matches(turn.accepted))return {accepted:true,kind:"correct",message:turn.optional&&matches(turn.optional)?"Состояние передано. Можно добавить благодарность.":"Смысл передан верно."};
  if(turn.courtesy&&matches(turn.courtesy))return {accepted:true,kind:"courtesy",message:"Состояние передано. Проверьте obrigado / obrigada: форма зависит от говорящего."};
  if([...turn.accepted,...turn.courtesy??[]].some(item=>spelling(item)===spelling(value)))return {accepted:false,kind:"writing",message:"Смысл узнаваем. Проверьте диакритику и дефис; исправьте написание."};
  const forms:Record<string,readonly [string,string]>={"Como te chamas?":["como te chama","Для обращения на «ты» проверьте форму chamas."],"De onde és?":["de onde é","Для обращения на «ты» проверьте форму és."],"Como estás?":["como está","Для обращения на «ты» проверьте форму estás."]};
  if(forms[turn.answer]?.[0]===answer)return {accepted:false,kind:"form",message:forms[turn.answer][1]};
  return {accepted:false,kind:"meaning",message:turn.feedback};
}
export type ConversationEvidence={help:number;corrected:boolean;writing:boolean;courtesy:boolean;done:boolean};
export const emptyConversationEvidence=():ConversationEvidence=>({help:0,corrected:false,writing:false,courtesy:false,done:false});
export function applyConversationCheck(previous:ConversationEvidence,result:ConversationCheck):ConversationEvidence{
  return {...previous,done:result.accepted,corrected:previous.corrected||result.kind==="meaning"||result.kind==="form",writing:previous.writing||result.kind==="writing",courtesy:previous.courtesy||result.kind==="courtesy"};
}
export const conversationIndependent=(row:ConversationEvidence)=>row.done&&!row.help&&!row.corrected;
