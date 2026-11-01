import {calendarLessons,calendarDays,calendarMonths,buildCalendarUsage} from "./calendar.ts";
import {calendarPortuguese,clockGuide,knucklePages} from "./calendar-language.ts";
import {clockExamples,clockSetTasks} from "./clock-lesson.ts";
import {cooperationGlossary} from "./cooperation-translations.ts";

export const calendarTranslations:Record<string,string>={
  "O tempo e o calendário":"Время и календарь","Horas":"Часы","Aprender":"Объяснение","Palavras":"Слова темы","Praticar":"Практика","Os nós dos dedos":"Костяшки пальцев",
  "Um passo de cada vez: as horas, a semana, os meses e as datas.":"Шаг за шагом: часы, неделя, месяцы и даты.",
  "Hoje é ":"Сегодня ","Depois de sexta-feira vem ":"После пятницы наступает ","O encontro é no ":"Встреча в ","O primeiro mês é ":"Первый месяц — ","Depois de março vem ":"После марта наступает ","O aniversário é em ":"День рождения в ","Depois de setembro vem ":"После сентября наступает ","O último mês é ":"Последний месяц — ","O encontro é em ":"Встреча в ","Hoje é dia cinco de ":"Сегодня пятое ","O encontro é no dia doze de ":"Встреча двенадцатого ","A festa é no dia três de ":"Праздник третьего ",
  "Que horas são?":"Который час?","Escreve a hora em português":"Напиши время по-португальски","Vê a hora em números":"Показать время цифрами","Ponteiro das horas":"Часовая","Ponteiro dos minutos":"Минутная","Minutos":"Минуты","Verificar":"Проверить","Ajuda":"Подсказка","Seguinte →":"Дальше →","Correto!":"Верно!","Tenta outra vez.":"Попробуй ещё раз.","A hora está certa. Agora escreve por palavras.":"Время прочитано верно. Теперь напиши словами.",
  "Escolhe um ponteiro e toca num número. Também podes usar as listas ou as teclas de seta. Cada passo vale cinco minutos.":"Выбери стрелку и нажми на число. Можно пользоваться списками или стрелками на клавиатуре. Шаг — пять минут.",
  "Dia: hora do almoço.":"День: время обеда.","Noite: começa um novo dia.":"Ночь: начинается новый день.","É tarde: falta pouco para a meia-noite.":"Поздний вечер: скоро полночь.",
  "Aprender as horas":"Разобраться с часами","Ler o relógio":"Назови время","Acertar os ponteiros":"Выставь стрелки","nó":"костяшка","espaço":"впадинка",
};
for(const [pt,ru] of [...calendarDays,...calendarMonths])calendarTranslations[pt]=ru;
for(const page of [...clockGuide,...knucklePages]){calendarTranslations[page.title]=page.ruTitle;calendarTranslations[page.pt]=page.ru;}
for(const task of [...clockExamples,...clockSetTasks])calendarTranslations[task.phrase]=task.translation;
const modules=buildCalendarUsage(id=>id);
for(const lesson of calendarLessons){
  const pt=calendarPortuguese[lesson.id];
  calendarTranslations[lesson.title.split(" — ")[0]]=lesson.title.split(" — ")[1];
  calendarTranslations[pt.intro]=lesson.child;
  calendarTranslations[pt.explanation]=lesson.explanation;
  lesson.tasks.forEach(([ru],i)=>{calendarTranslations[pt.feedback[i]]=ru;});
}
for(const item of modules){item.examples.forEach(e=>{calendarTranslations[e.portuguese]=e.translation;});item.exercises.forEach(e=>{calendarTranslations[e.prompt]=e.promptTranslation!;});}
const monthGenitive=["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
const monthIn=["январе","феврале","марте","апреле","мае","июне","июле","августе","сентябре","октябре","ноябре","декабре"];
for(const item of modules)for(const task of item.exercises)for(const option of task.options){
  const month=calendarMonths.findIndex(([pt])=>pt===option.text);
  let ru=calendarTranslations[task.before]??task.before;
  const ending=month>=0&&/ de $/.test(task.before)?monthGenitive[month]:month>=0&&/ em $/.test(task.before)?monthIn[month]:task.before==="O encontro é no "&&option.text==="sábado"?"субботу":calendarTranslations[option.text]??option.text;
  ru+=ending+task.after;
  calendarTranslations[`${task.before}${option.text}${task.after}`]=ru;
}
export const calendarGlossary:Record<string,string>={...cooperationGlossary,...Object.fromEntries([...calendarDays,...calendarMonths]),
  "tem":"имеет / в нём есть","encontro":"встреча","segundas-feiras":"понедельники","aniversário":"день рождения","às":"в (о времени)","dos":"de + os","quarto":"четверть / четвёртый","meia":"половина","completa":"дополни","festa":"праздник","pelos":"por + os: по","escolhe":"выбери","toca":"коснись / нажми","listas":"списки","teclas":"клавиши","seta":"стрелка","nós":"костяшки / мы","dedos":"пальцы",
  "meio-dia":"полдень","meia-noite":"полночь","um quarto":"четверть часа","e meia":"и половина","letra minúscula":"строчная буква","ano bissexto":"високосный год","nós dos dedos":"костяшки пальцев","dedo indicador":"указательный палец","dedo mindinho":"мизинец",
  "tempo":"время","calendário":"календарь","semana":"неделя","dia":"день","dias":"дни","mês":"месяц","meses":"месяцы","ano":"год","data":"дата","datas":"даты","horas":"часы","hora":"час","minutos":"минуты","minuto":"минута","ponteiro":"стрелка","ponteiros":"стрелки","curto":"короткий","comprido":"длинный","indica":"показывает","indicar":"указать","número":"число","números":"числа","mostrador":"циферблат","vale":"означает / стоит","certas":"ровные / точные","outras":"другие","são":"являются","dizemos":"говорим","significa":"означает","quinze":"пятнадцать","trinta":"тридцать","sete":"семь","oito":"восемь","cinco":"пять","doze":"двенадцать","três":"три","vinte":"двадцать","seis":"шесть","quatro":"четыре","mil":"тысяча","zero":"ноль","falta":"осталось","quanto":"сколько","manhã":"утро","tarde":"день / вечер","noite":"ночь","há":"есть / имеется","repete-se":"повторяется","duas vezes":"два раза","hoje":"сегодня","entre":"между","acontecimento":"событие","lê-se":"читается","lemos":"читаем","primeiros":"первые","primeiro":"первый / сначала","último":"последний","bissexto":"високосный","artigo":"артикль","sem":"без","minúscula":"строчная","escrevem-se":"пишутся","escreve":"напиши","contar":"считать","contas":"считаешь","fecha":"сожми / закрой","mão":"рука / кисть","começa":"начинается / начни","alterna":"чередуй","espaço":"впадинка / промежуток","nó":"костяшка / узел","dedo":"палец","indicador":"указательный","mindinho":"мизинец","exceto":"кроме","volta":"вернись","início":"начало","continua":"продолжай","sentido":"направление","segue":"следуй","diz":"скажи","enquanto":"пока / в то время как","pequeno":"маленький","almoço":"обед","conhecer":"познакомиться / узнать","continuar":"продолжать","aprender":"учиться","passo":"шаг","certo":"верно","acertar":"установить правильно","ler":"читать","relógio":"часы","palavras":"слова","uma semana":"одна неделя","um ano":"один год","todas":"все","vezes":"разы","até":"до","letra":"буква","indicam":"показывают","num":"в одном","do":"de + o","semanas":"недели",
};
