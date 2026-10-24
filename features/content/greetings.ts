import {routeLessonExperiences} from "./first-vertical-slice/route-extension.ts";

// Reuse the existing introduction chunks; expansion does not change their save IDs.
const introduction=routeLessonExperiences.find(lesson=>lesson.id==="lesson:a1-1:introduce-yourself")!;
type Phrase={pt:string;ru:string;note?:string};
type GreetingCheck={id:string;prompt:string;options:readonly string[];answer:number;feedback:string};
type GreetingSet={id:string;pt:string;ru:string;adultCue:string;childCue:string;phrases:readonly Phrase[];checks:readonly GreetingCheck[]};
export const greetingSets:readonly GreetingSet[]=[
  {id:"greetings:hello",pt:"Olá!",ru:"Поздороваться",adultCue:"Выбери приветствие по времени суток. Olá подходит и для короткого дружелюбного приветствия.",childCue:"Утром ты встречаешь учителя, а вечером — друга. Как поздороваться?",phrases:[
    introduction.vocabulary!.find(word=>word.pt==="Olá!")!,
    {pt:"Bom dia!",ru:"Доброе утро! / Добрый день!",note:"Обычно до полудня."},
    {pt:"Boa tarde!",ru:"Добрый день!",note:"После полудня, пока не наступил вечер."},
    {pt:"Boa noite!",ru:"Добрый вечер! / Спокойной ночи!",note:"Вечером — при встрече; перед сном — при прощании."},
  ],checks:[
    {id:"greetings:morning",prompt:"Утром ты входишь в класс. Что скажешь?",options:["Bom dia!","Até amanhã!","Boa noite!"],answer:0,feedback:"Bom dia! — утреннее приветствие. Até amanhã — прощание, Boa noite — вечер или ночь."},
    {id:"greetings:afternoon",prompt:"В три часа дня вы встречаетесь. Выбери приветствие по времени суток.",options:["Boa noite!","Boa tarde!","Bom fim de semana!"],answer:1,feedback:"Boa tarde! — приветствие после полудня. Bom fim de semana — пожелание хороших выходных."},
  ]},
  {id:"greetings:introduce",pt:"Muito prazer",ru:"Представиться",adultCue:"Спроси имя и представься. В этом диалоге обращаемся на «ты»; формы вежливого обращения будем разбирать отдельно.",childCue:"Познакомь двух персонажей. Можно придумать им любые имена — своё называть не обязательно.",phrases:introduction.vocabulary!.filter(word=>["Como te chamas?","Chamo-me…","Muito prazer."].includes(word.pt)),checks:[
    {id:"greetings:ask-name",prompt:"Ты хочешь узнать имя нового знакомого. Что спросишь?",options:["Como estás?","Como te chamas?","E tu?"],answer:1,feedback:"Como te chamas? — Как тебя зовут? Como estás? — Как ты? Это разные вопросы."},
    {id:"greetings:introduce-miguel",prompt:"Представь персонажа от его лица: его зовут Мигел.",options:["Chamo-me Miguel.","Como te chamas?","Até logo!"],answer:0,feedback:"Chamo-me Miguel. — Меня зовут Мигел. Имя меняется, а готовая конструкция Chamo-me остаётся."},
  ]},
  {id:"greetings:conversation",pt:"Como estás?",ru:"Как дела",adultCue:"Продолжи короткий разговор: ответь, поблагодари и задай встречный вопрос.",childCue:"Спроси друга, как он. Ответь за персонажа и не забудь спросить в ответ!",phrases:[
    {pt:"Como estás?",ru:"Как ты? / Как дела?",note:"Обращение на «ты»."},
    {pt:"Estou bem.",ru:"У меня всё хорошо."},
    {pt:"Obrigado / Obrigada.",ru:"Спасибо.",note:"Говорящий мужчина: obrigado; говорящая женщина: obrigada."},
    {pt:"E tu?",ru:"А ты?"},
  ],checks:[
    {id:"greetings:answer-how",prompt:"Тебя спросили Como estás? Ответь, что всё хорошо.",options:["Muito prazer.","Estou bem, obrigado.","Chamo-me Rui."],answer:1,feedback:"Estou bem, obrigado. — У меня всё хорошо, спасибо. Здесь отвечает Руй; Рита сказала бы obrigada."},
    {id:"greetings:ask-back",prompt:"Ты уже ответил, как дела. Как коротко спросить «А ты?»",options:["Até amanhã!","E tu?","Bom dia!"],answer:1,feedback:"E tu? — А ты? Так возвращаем вопрос собеседнику."},
  ]},
  {id:"greetings:goodbye",pt:"Até amanhã!",ru:"Попрощаться",adultCue:"Попрощайся с учётом того, когда вы увидитесь снова. Пожелание можно добавить к прощанию.",childCue:"Уроки закончились. С кем увидишься завтра, а с кем — после выходных?",phrases:[
    {pt:"Adeus!",ru:"До свидания! / Пока!"},
    {pt:"Até logo!",ru:"До скорого!",note:"Обычно, если ожидаешь увидеться позже в тот же день."},
    {pt:"Até amanhã!",ru:"До завтра!"},
    {pt:"Bom fim de semana!",ru:"Хороших выходных!"},
  ],checks:[
    {id:"greetings:tomorrow",prompt:"Вы расходитесь и договорились встретиться завтра. Что скажешь?",options:["Muito prazer.","Até amanhã!","Como estás?"],answer:1,feedback:"Até amanhã! — До завтра! Указываем, когда увидимся снова."},
    {id:"greetings:weekend",prompt:"В пятницу ты хочешь пожелать хороших выходных.",options:["Bom fim de semana!","Bom dia!","Chamo-me Rita."],answer:0,feedback:"Bom fim de semana! — Хороших выходных! Это пожелание можно добавить после прощания."},
  ]},
];
export const greetingExtras:readonly Phrase[]=[
  {pt:"Boas festas!",ru:"Счастливых праздников!",note:"Часто пожелание к рождественским и новогодним праздникам."},
  {pt:"Boas férias!",ru:"Хороших каникул! / Хорошего отпуска!"},
];
