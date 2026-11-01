import {cooperationLessons,cooperationPortuguese} from "./cooperation.ts";

export const cooperationTranslations:Record<string,string>={
  "Conversar e chegar a acordo":"Общаемся и договариваемся",
  "Estudo do Meio · Material de apoio escolar":"Окружающий мир · Школьный материал",
  "Como podemos chegar a acordo?":"Как мы можем договориться?",
  "História":"История","Aprender":"Объяснение","Praticar":"Практика",
  "Diálogo":"Диалог","Negociação":"Обсуждение вариантов","Compromisso":"Договорённость",
  "Ouvir e compreender":"Выслушать и понять","Propor soluções":"Предложить решения","Combinar e cumprir":"Договориться и выполнить",
};
const optionTranslations=[
  [["Дождаться своей очереди.","Перебить Риту.","Кричать громче."],["Твоя очередь.","Тебе нельзя говорить.","Только я могу говорить."],["Давай поговорим спокойно.","Давай кричать.","Я никого не хочу слушать."]],
  [["Мне грустно.","Ты всегда плохой.","Тебе нельзя говорить."],["Можешь остановиться, пожалуйста?","Я испорчу твой рисунок.","Я тебя толкну."],["К взрослому, которому она доверяет.","Ни к кому.","Только к тому, кто её толкает."]],
  [["диалог","обсуждение вариантов","договорённость"],["диалог","обсуждение вариантов","договорённость"],["диалог","обсуждение вариантов","договорённость"]],
];
for(const [index,lesson] of cooperationLessons.entries()){
  const pt=cooperationPortuguese[lesson.id];
  cooperationTranslations[lesson.title.split(" — ")[0]]=lesson.title.split(" — ")[1];
  cooperationTranslations[pt.story]=lesson.child;
  cooperationTranslations[pt.adult]=lesson.adult;
  cooperationTranslations[pt.explanation]=lesson.explanation;
  cooperationTranslations[lesson.caption.split(" — ")[0]]=lesson.caption.split(" — ")[1];
  lesson.examples.forEach(([p,r])=>{cooperationTranslations[p]=r;});
  lesson.tasks.forEach(([p,r,options,,feedback],i)=>{
    cooperationTranslations[p]=r;
    cooperationTranslations[pt.feedback[i]]=feedback;
    options.forEach((option,j)=>{cooperationTranslations[option]=optionTranslations[index][i][j];});
  });
}

/** Reviewed contextual glosses; fixed phrases take precedence over isolated words. */
export const cooperationGlossary:Record<string,string>={
  "pela":"por + a: по / через","pausa":"пауза","é":"это / является","damos":"даём","à":"a + a: в / к","favor":"услуга; por favor — пожалуйста","adulto":"взрослый","vem":"приходит / идёт","encontrar":"найти","pontos":"точки / пункты","vista":"взгляд","cumpri-lo":"выполнить его","esta":"эта / этот",
  "chegar a acordo":"договориться","à vez":"по очереди","a tua vez":"твоя очередь","pela sua vez":"своей очереди","por favor":"пожалуйста","adulto de confiança":"взрослый, которому можно доверять","ao mesmo tempo":"одновременно","até ao fim":"до конца","pontos de vista":"точки зрения","estudo do meio":"окружающий мир","é preciso":"нужно","é a vez":"сейчас очередь","não gosto disso":"мне это не нравится",
  "o":"определённый артикль мужского рода","a":"артикль женского рода / предлог к","os":"определённый артикль во множественном числе","as":"определённый артикль во множественном числе","um":"один / неопределённый артикль","uma":"одна / неопределённый артикль",
  "de":"из / о / принадлежность","do":"de + o","da":"de + a","em":"в","no":"em + o: в","na":"em + a: в","ao":"a + o: к","com":"с","sem":"без","para":"для / чтобы","por":"по / из-за","e":"и","ou":"или","mas":"но","se":"если / возвратная частица","não":"не / нет","só":"только","já":"уже","ainda":"ещё","depois":"потом / после","quando":"когда","porque":"потому что","assim":"так","até":"до","também":"тоже","que":"что / который","quê":"что","quem":"кто","como":"как","qual":"какой","cada":"каждый","ambos":"оба","dois":"два","duas":"две","outra":"другая","outro":"другой","outros":"другие","mesmo":"тот же","mesmos":"те же","várias":"несколько / разные","estes":"эти","tudo":"всё","ninguém":"никто","alguém":"кто-то",
  "eu":"я","tu":"ты","ela":"она","te":"тебя / тебе","nos":"нам / нас / себе","sua":"его / её / своя","seu":"его / её / свой","tua":"твоя","teu":"твой","nossa":"наша","lo":"его / это","los":"их","usá-los":"пользоваться ими","empurrar-te":"толкнуть тебя","ajuda-nos":"помогает нам",
  "rui":"Руй","rita":"Рита","ana":"Ана","luís":"Луиш","têm":"у них есть","temos":"у нас есть","quer":"хочет","querem":"хотят","quero":"хочу","precisa":"ему / ей нужно","precisam":"им нужно","preciso":"мне нужно","pode":"может","podem":"могут","podemos":"можем","podes":"можешь","posso":"могу","vamos":"давай / давайте","vou":"я буду / иду","vão":"они будут / идут","está":"находится / сейчас является","estão":"находятся / сейчас являются","estamos":"мы сейчас","estou":"я сейчас","és":"ты являешься","ser":"быть","deve":"должен / должна","devemos":"мы должны","faz":"делает","fazemos":"делаем","fazer":"делать",
  "caixa":"коробка","lápis":"карандаш / карандаши","desenho":"рисунок","material":"материал / принадлежности","pessoas":"люди","pessoa":"человек","escola":"школа","casa":"дом","trabalho":"работа","tempo":"время","vez":"очередь / раз","palavra":"слово","fala":"говорит / речь","falar":"говорить","falamos":"говорим","conversar":"разговаривать","diálogo":"диалог","negociação":"обсуждение вариантов","compromisso":"договорённость / обязательство","acordo":"согласие / договорённость","solução":"решение","soluções":"решения","problema":"проблема","etapa":"этап","tarefa":"задание","parte":"часть","maneiras":"способы","proposta":"предложение","pedido":"просьба","passos":"шаги","limites":"границы","sentimento":"чувство","triste":"грустный / грустная","tristeza":"грусть","raiva":"злость","zangados":"рассерженные","calma":"спокойствие","mau":"плохой","alto":"громко / высокий","mais":"больше / более","muito":"очень","sempre":"всегда","importante":"важный","claro":"понятный / ясный","boa":"хорошая","juntos":"вместе","seguro":"безопасный","segurança":"безопасность","lugar":"место","ajuda":"помощь","confiança":"доверие","primeiro":"сначала / первый","fim":"конец","frase":"фраза",
  "ouvir":"слушать","ouve":"слушает","ouvem":"слушают","ouvimos":"слушаем","ouviram":"выслушали","ouvirmos":"когда мы выслушаем","esperar":"ждать","esperamos":"ждём","interromper":"перебивать","interromperem":"когда они перебивают","gritar":"кричать","insultar":"оскорблять","respeitar":"уважать","respeitamos":"уважаем","discordar":"не соглашаться","compreender":"понять","explica":"объясняет","explicar":"объяснять","diz":"говорит","dizer":"сказать","sente":"чувствует","sinto":"чувствую","sentimos":"чувствуем","sentir":"чувствовать","pedir":"просить","pedimos":"просим","perguntamos":"спрашиваем","adivinhamos":"угадываем","acusar":"обвинять","aconteceu":"случилось","acabou":"закончил","perceber":"понять","mudar":"изменить","parar":"остановиться","magoar":"обижать / причинять боль","magoa":"причиняет боль","ameaça":"угрожает","deixa":"позволяет","sair":"выйти","empurra":"толкает","empurrar":"толкать","estragar":"испортить","mexam":"трогают","gosta":"нравится","gosto":"мне нравится","disso":"этого / это","procuramos":"ищем","negociar":"договариваться","propomos":"предлагаем","propõem":"предлагают","propor":"предложить","comparamos":"сравниваем","discutimos":"обсуждаем","escolhem":"выбирают","decidem":"решают","concordam":"согласны","aceitam":"принимают","aceitar":"принять","aceite":"принятый","combinamos":"договариваемся","combinar":"договориться","cumprimos":"выполняем","cumprir":"выполнить","resultar":"получиться / сработать","voltar":"вернуться","voltamos":"возвращаемся","dividir":"разделить","partilhar":"делиться","partilham":"делятся","usar":"пользоваться","usamos":"пользуемся","desenhar":"рисовать","desenham":"рисуют","aprender":"учиться","praticar":"практиковаться","história":"история","ouvir e compreender":"выслушать и понять","material de apoio escolar":"школьный вспомогательный материал",
};
