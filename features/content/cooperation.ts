import {feelingWords} from "./feelings-lesson.ts";
import type {VocabularyGroup,VocabularyWord} from "./vocabulary-model.ts";
import type {UsageModule} from "./learning-model.ts";

export const cooperationWords:VocabularyWord[]=[
  {id:"vocabulary:cooperation:your-turn",label:"É a tua vez.",translation:"Твоя очередь."},
  {id:"vocabulary:cooperation:share",label:"Podemos partilhar.",translation:"Мы можем поделиться."},
  {id:"vocabulary:cooperation:calm",label:"Vamos falar com calma.",translation:"Давай поговорим спокойно."},
  {id:"vocabulary:cooperation:help",label:"Preciso de ajuda.",translation:"Мне нужна помощь."},
  {id:"vocabulary:cooperation:dislike",label:"Não gosto disso.",translation:"Мне это не нравится."},
  {id:"vocabulary:cooperation:stop",label:"Podes parar, por favor?",translation:"Можешь остановиться, пожалуйста?"},
  {id:"vocabulary:cooperation:dialogue",label:"o diálogo",translation:"диалог",noun:{lemma:"diálogo",article:"o",plural:"diálogos",pluralArticle:"os"}},
  {id:"vocabulary:cooperation:negotiation",label:"a negociação",translation:"обсуждение вариантов / переговоры",noun:{lemma:"negociação",article:"a",plural:"negociações",pluralArticle:"as"}},
  {id:"vocabulary:cooperation:agreement",label:"o compromisso",translation:"договорённость / обязательство",noun:{lemma:"compromisso",article:"o",plural:"compromissos",pluralArticle:"os"}},
];
export const cooperationPortuguese={
  rules:{story:"O Rui e a Rita têm uma caixa de lápis. Os dois querem desenhar ao mesmo tempo. Como podem conversar sem se interromperem?",adult:"Duas pessoas precisam do mesmo material. Cada uma explica o que precisa e ouve a outra. Podemos usar estes passos na escola, em casa ou no trabalho.",explanation:"Ouvimos até ao fim e esperamos pela nossa vez. Podemos discordar sem insultar. Se estamos muito zangados, podemos fazer uma pausa e voltar a falar com calma.",feedback:["Primeiro, ouvimos a Rita. Depois, é a vez do Rui.","É a tua vez. Assim, damos a palavra à outra pessoa.","Falar com calma ajuda-nos a ouvir e a compreender o outro."]},
  feelings:{story:"A Rita está triste porque não a ouvem. Pode dizer o que sente e pedir para parar. Podemos sentir tristeza ou raiva, mas não devemos magoar os outros.",adult:"Falamos do que sentimos e do que aconteceu, sem acusar a outra pessoa. Um pedido claro ajuda a perceber o que é preciso mudar.",explanation:"Podemos dizer: «Estou triste» ou «Não gosto disso». Depois, fazemos um pedido claro. Não adivinhamos o que o outro sente: perguntamos e ouvimos. Se alguém nos magoa, ameaça ou não nos deixa sair, procuramos um lugar seguro e pedimos ajuda. Não temos de negociar quando não estamos em segurança.",feedback:["«Estou triste» fala de um sentimento, sem insultar a outra pessoa.","«Podes parar, por favor?» é um pedido claro para parar.","A Rita pode pedir ajuda a um adulto de confiança: «Preciso de ajuda». A segurança vem primeiro."]},
  solution:{story:"O Rui e a Rita já se ouviram. Podem partilhar os lápis ou usá-los à vez. Escolhem uma solução com que os dois concordam.",adult:"Depois de ouvirmos os dois pontos de vista, propomos várias soluções. O acordo deve ser claro e aceite por ambos: quem faz o quê e quando? Se não resultar, voltamos a conversar.",explanation:"Diálogo: cada um fala e ouve para compreender o problema. Negociação: propomos e comparamos soluções. Compromisso: combinamos o que vamos fazer e cumprimos o acordo. Não é preciso aceitar tudo: respeitamos os limites de cada pessoa.",feedback:["Diálogo: procuramos compreender o que é importante para cada pessoa.","Negociação: propomos e discutimos várias soluções.","Compromisso: os dois aceitam um acordo claro e vão cumpri-lo."]},
} as const;
const feelingIds=[1,3,4].map(i=>feelingWords[i].id);
export const cooperationGroup:VocabularyGroup={id:"vocabulary-cooperation",title:"Общаемся и договариваемся",subgroups:[
  {id:"cooperation-rules",title:"Слушаем по очереди",sets:[{id:"cooperation-rules",title:"Слушаем по очереди",words:cooperationWords.slice(0,4).map(word=>word.id)}]},
  {id:"cooperation-feelings",title:"Чувства и границы",sets:[{id:"cooperation-feelings",title:"Чувства и границы",words:[...feelingIds,...cooperationWords.slice(4,6).map(word=>word.id)]}]},
  {id:"cooperation-solution",title:"Ищем общее решение",sets:[{id:"cooperation-solution",title:"Ищем общее решение",words:cooperationWords.slice(6).map(word=>word.id)}]},
]};
export const cooperationLessons=[
  {id:"rules",title:"Ouvir e respeitar — Слушать и уважать",child:"У Руя и Риты одна коробка карандашей. Оба хотят рисовать прямо сейчас. Как сделать так, чтобы каждый мог высказаться?",adult:"Разные желания — обычная ситуация. Начнём с правил разговора: выслушать, назвать свою потребность и дать слово другому. История с карандашами — простой пример; те же шаги пригодятся дома и на работе.",explanation:"Уважать другого — не значит со всем соглашаться. Говорим по очереди, не перебиваем и не обзываемся. Можно попросить паузу и вернуться к разговору спокойнее.",scene:0,caption:"O Rui e a Rita querem usar os mesmos lápis. — Руй и Рита хотят пользоваться одними и теми же карандашами.",newIndices:[0,1,2,3],reviewed:[],examples:[
    ["É a tua vez.","Твоя очередь.",0], ["Vamos falar com calma.","Давай поговорим спокойно.",2],
  ],tasks:[
    ["A Rita ainda está a falar. O que pode fazer o Rui?","Рита ещё говорит. Что может сделать Руй?",["Esperar pela sua vez.","Interromper a Rita.","Gritar mais alto."],0,"Сначала выслушиваем Риту, затем говорим сами.",0],
    ["O Rui acabou de falar. O que pode dizer à Rita?","Руй закончил говорить. Что он может сказать Рите?",["É a tua vez.","Não podes falar.","Só eu posso falar."],0,"É a tua vez. — Твоя очередь. Даём слово собеседнику.",0],
    ["O Rui e a Rita estão a falar muito alto. Qual é uma boa proposta?","Руй и Рита говорят очень громко. Что можно предложить?",["Vamos falar com calma.","Vamos gritar.","Não quero ouvir ninguém."],0,"Можно снизить громкость или взять паузу, чтобы услышать друг друга.",2],
  ]},
  {id:"feelings",title:"Dizer o que sinto — Говорить о чувствах",child:"Рите грустно: её не слушают. Она может сказать, что чувствует, и попросить остановиться. Злиться или грустить можно; обижать другого — нет.",adult:"Отделяем чувство от обвинения: «Мне неприятно» вместо «Ты всегда всё портишь». Конкретная просьба помогает понять, какое действие нужно изменить.",explanation:"Называем чувство и говорим о конкретном действии. Не нужно угадывать чужие мысли по лицу — лучше спросить и выслушать ответ. Если тебя толкают, пугают или не дают уйти, сначала отойди в безопасное место и обратись за помощью. Договариваться в такой ситуации не обязательно.",scene:1,caption:"O Rui fala. A Rita ouve. Depois, é a vez da Rita. — Руй говорит, Рита слушает. Затем наступает очередь Риты.",newIndices:[4,5],reviewed:feelingIds,examples:[
    ["Não gosto disso.","Мне это не нравится.",4], ["Podes parar, por favor?","Можешь остановиться, пожалуйста?",5],
  ],tasks:[
    ["A Rita diz que está triste. Qual frase fala do que ela sente?","Рита говорит, что ей грустно. Какая фраза называет её чувство?",["Estou triste.","Tu és sempre mau.","Não podes falar."],0,"Estou triste. — Мне грустно. Говорим о своём состоянии, не навешиваем ярлык на другого.",4],
    ["O Rui não gosta que mexam no seu desenho. Como pode pedir para parar?","Рую не нравится, что трогают его рисунок. Как попросить остановиться?",["Podes parar, por favor?","Vou estragar o teu desenho.","Vou empurrar-te."],0,"Podes parar, por favor? — Вежливая и ясная просьба прекратить действие.",5],
    ["Alguém empurra a Rita e não para. A quem pode pedir ajuda?","Кто-то толкает Риту и не останавливается. К кому можно обратиться за помощью?",["A um adulto de confiança.","A ninguém.","Só a quem a empurra."],0,"Можно сказать Preciso de ajuda. — Мне нужна помощь. Безопасность важнее попытки договориться.",3],
  ]},
  {id:"solution",title:"Encontrar uma solução — Найти решение",child:"Руй и Рита услышали друг друга. Теперь они могут предложить варианты: поделиться карандашами или пользоваться ими по очереди. Выберут то, что подходит обоим.",adult:"После обмена мнениями обсуждаем несколько вариантов. Договорённость должна быть понятной и добровольной: кто, что и когда делает. Если она не работает, возвращаемся к обсуждению.",explanation:"Diálogo — выслушать друг друга и понять проблему. Negociação — обсудить варианты, учитывая обоих. Compromisso — договориться о действиях и выполнять договорённость. Это не обещание обязательно уступить: у каждого остаются свои границы.",scene:2,caption:"Partilham os lápis e desenham juntos. — Они делятся карандашами и рисуют вместе.",newIndices:[6,7,8],reviewed:[],examples:[
    ["Podemos partilhar.","Мы можем поделиться.",1], ["Temos um compromisso: usamos os lápis à vez.","У нас договорённость: пользуемся карандашами по очереди.",8],
  ],tasks:[
    ["Cada um explica o que quer e ouve o outro. Que etapa é esta?","Каждый объясняет, чего хочет, и слушает другого. Какой это этап?",["o diálogo","a negociação","o compromisso"],0,"Diálogo: сначала понимаем, что важно каждому.",6],
    ["A Ana e o Luís propõem duas maneiras de dividir uma tarefa. Que etapa é esta?","Ана и Луиш предлагают два способа разделить задание. Какой это этап?",["o diálogo","a negociação","o compromisso"],1,"Negociação: обсуждаем варианты решения, а не навязываем один.",7],
    ["A Ana e o Luís decidem: cada um faz uma parte. Ambos concordam. Que etapa é esta?","Ана и Луиш решили: каждый делает одну часть. Оба согласны. Какой это этап?",["o diálogo","a negociação","o compromisso"],2,"Compromisso: есть понятная договорённость, с которой согласны оба.",8],
  ]},
] as const;

export function buildCooperationUsage(meaningFor:(id:string)=>string):UsageModule[]{return cooperationLessons.map(lesson=>({
  id:`usage:cooperation:${lesson.id}`,title:lesson.title,situation:"Прочитай ситуацию и выбери подходящее действие или реплику. Перевод вопроса — по кнопке i.",collectionIds:[`collection:cooperation-${lesson.id==="solution"?"solution":lesson.id}`],
  newMeaningIds:lesson.newIndices.map(i=>meaningFor(cooperationWords[i].id)),reviewedMeaningIds:lesson.reviewed.map(meaningFor),recognitionOnly:["ouvir","esperar","interromper","gritar","partilhar","à vez","ambos concordam","adulto de confiança"],
  examples:lesson.examples.map(([portuguese,translation,index],i)=>({id:`example:cooperation:${lesson.id}:${i}`,portuguese,translation,meaningIds:[meaningFor(cooperationWords[index].id)],grammarTopicIds:[]})),
  exercises:lesson.tasks.map(([prompt,promptTranslation,texts,answer,,index],i)=>({id:`cloze:cooperation:${lesson.id}:${i}`,prompt,promptTranslation,before:"",after:"",correctOptionId:`option:${answer}`,feedback:cooperationPortuguese[lesson.id].feedback[i],options:texts.map((text,j)=>({id:`option:${j}`,text,meaningId:meaningFor(cooperationWords[index].id)})).map((_,j,all)=>all[(j+i+1)%all.length])})),relatedLinks:[],
}));}
