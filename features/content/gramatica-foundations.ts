import { grammarLesson as lesson } from "./gramatica-lesson-factory.ts";
import { shortGrammarLessons } from "./short-grammar-lessons.ts";
const source=(id:string)=>shortGrammarLessons.find(row=>row.id===id)!;
/** Reviewed grammar, familiar words; existing foundation lessons remain canonical explanations. */
export const foundationGrammarLessons=[
  lesson("identity-and-origin",1,"SER · Кто, откуда и что это","Я могу представить человека и назвать происхождение, профессию и свойства предмета.",
    "SER связывает человека или предмет с тем, кем или чем он является: профессией, происхождением, материалом, принадлежностью. Он также нужен для времени и места события. Это не правило «всегда навсегда»: профессия может измениться. Формы: sou, és, é, somos, são.",source("ser").examples,[],["местоимения","знакомые профессии и страны"],[
      ["origin","Впиши SER: Eu ___ de Portugal.","sou","Eu sou de Portugal — я из Португалии."],
      ["profession","Она врач: A Rita ___ médica.","é","Профессия: ela é médica.",["está","são"]],
      ["we","Мы студенты: Nós ___ estudantes.","somos","Nós somos estudantes.",["são","sou"]],
      ["material","Стол сделан из дерева: A mesa ___ de madeira.","é","Материал: ser de madeira.",["está","estão"]],
      ["you","Впиши SER: Tu ___ professor.","és","С tu используется és."],
      ["ownership","Впиши SER: Este livro ___ da Ana.","é","Ser de указывает на принадлежность."],
    ],[
      ["they","Впиши SER: A Ana e o Rui ___ portugueses.","são","Два человека: eles são."],
      ["time","Впиши SER: ___ duas horas.","São","Часы: são duas horas, но é uma hora."],
      ["event","Впиши SER: A reunião ___ na escola.","é","Место проведения события: a reunião é na escola."],
      ["describe","Впиши SER: O livro ___ interessante.","é","Здесь характеризуем книгу: é interessante."],
      ["geography","Впиши SER для географического положения: Coimbra ___ em Portugal.","é","Для фиксированного географического положения книга использует SER."],
      ["marital","Впиши SER: A minha irmã ___ casada.","é","Семейное положение: é casada."],
    ],[
      ["introduce","Впиши SER: Eu ___ a Marta.","sou","Представление: Eu sou a Marta."],
      ["origin-plural","Впиши SER: Os meus amigos ___ de Lisboa.","são","Множественное число: são de Lisboa."],
      ["profession-we","Впиши SER: Nós ___ médicos.","somos","Профессия с nós: somos."],
      ["material-new","Впиши SER: A cadeira ___ de madeira.","é","Материал предмета: é de madeira."],
      ["event-time","Впиши две формы SER через пробел: A aula ___ às nove e os alunos ___ portugueses.","é são","Событие: a aula é; характеристика людей: os alunos são."],
    ]),
  lesson("location-and-state",2,"ESTAR · Где и как я себя чувствую","Я могу назвать местонахождение и состояние человека.",
    "ESTAR показывает местонахождение человека или предмета и состояние в ситуации: estou em casa, está cansada. Долгая длительность не превращает местонахождение в SER. Место события — другое значение: a aula é na escola. Формы: estou, estás, está, estamos, estão.",source("estar").examples,[],["SER","места и состояния"],[
      ["where-i","Впиши ESTAR: Eu ___ em casa.","estou","Eu estou em casa — я дома."],
      ["state-she","Ана устала: A Ana ___ cansada.","está","Состояние: está cansada.",["é","estão"]],
      ["where-we","Мы в школе: Nós ___ na escola.","estamos","Местонахождение: estamos.",["somos","está"]],
      ["where-they","Книги на столе: Os livros ___ na mesa.","estão","Для нескольких предметов: estão.",["são","está"]],
      ["state-you","Впиши ESTAR: Tu ___ bem?","estás","С tu: estás bem?"],
      ["where-book","Впиши ESTAR: O livro ___ ali.","está","Местонахождение предмета: está ali."],
    ],[
      ["state-we","Впиши ESTAR: Nós ___ contentes.","estamos","Наше состояние: estamos contentes."],
      ["where-she","Впиши ESTAR: A médica ___ no hospital.","está","Здесь сообщаем, где находится врач."],
      ["state-door","Впиши ESTAR: A porta ___ aberta.","está","Состояние двери: está aberta."],
      ["negative","Впиши ESTAR: Eu não ___ cansado.","estou","Отрицание не меняет форму: não estou."],
      ["weather","Впиши ESTAR: Hoje ___ muito frio lá fora.","está","Погода в текущей ситуации: está muito frio."],
      ["sleepy","Впиши ESTAR: Nós ___ com sono.","estamos","Estar com sono — хотеть спать."],
    ],[
      ["where-you","Впиши ESTAR: Tu ___ no café.","estás","Местонахождение с tu: estás."],
      ["where-parents","Впиши ESTAR: Os meus pais ___ em casa.","estão","Os meus pais: eles estão."],
      ["state-i","Впиши ESTAR: Hoje eu ___ contente.","estou","Eu estou contente — я сейчас рад(а)."],
      ["weather-today","Впиши ESTAR: Hoje ___ muito calor.","está","О погоде сегодня: está muito calor."],
      ["plural-state","Впиши две формы ESTAR через пробел: A Rita ___ bem e nós ___ cansados.","está estamos","A Rita está; nós estamos. Обе формы описывают состояние."],
    ]),
  lesson("identity-or-state",3,"SER / ESTAR · Выбираем смысл","Я могу различить характеристику, состояние, местонахождение и место события.",
    "Выбирайте по смыслу, а не только по длительности. SER: кто это, происхождение, характеристика, место события. ESTAR: где находится человек или предмет, состояние в ситуации. A Ana é médica, mas hoje está cansada. A escola está em Lisboa; a reunião é na escola.",source("ser-estar").examples,[],["формы SER и ESTAR","знакомые места и профессии"],[
      ["profession","Руй работает учителем: O Rui ___ professor.","é","Профессия — SER.",["está","estão"]],
      ["location","Руй сейчас в школе: O Rui ___ na escola.","está","Местонахождение человека — ESTAR.",["é","são"]],
      ["state","Сегодня мы устали: Hoje nós ___ cansados.","estamos","Состояние людей — ESTAR.",["somos","são"]],
      ["event","Встреча проводится в кафе: A reunião ___ no café.","é","Место события — SER.",["está","estão"]],
      ["origin","Впиши SER или ESTAR: Eu ___ de Braga.","sou","Происхождение: sou de Braga."],
      ["contrast","Впиши две формы через пробел: Ela ___ médica, mas hoje ___ doente.","é está","Профессия — é; состояние — está."],
    ],[
      ["person-location","Ана находится в Порту: A Ana ___ no Porto.","está","Местонахождение человека: ESTAR."],
      ["lesson-event","Урок проводится в школе: A aula ___ na escola.","é","Место проведения урока — SER."],
      ["character","По характеру Ана спокойная: A Ana ___ calma.","é","Характеристика человека: é calma."],
      ["moment","Обычно Ана волнуется, но сейчас спокойна: Agora a Ana ___ calma.","está","Состояние в данной ситуации: está calma."],
      ["inherent","Общая характеристика морской воды: A água do mar ___ salgada.","é","Характеристика воды вообще: é salgada."],
      ["result","Окно закрыли: Agora a janela ___ fechada.","está","Состояние как результат действия: está fechada."],
    ],[
      ["we-origin","Впиши SER или ESTAR: Nós ___ de Coimbra.","somos","Происхождение: somos de Coimbra."],
      ["they-location","Впиши SER или ESTAR: Os alunos ___ na biblioteca agora.","estão","Местонахождение учеников: estão."],
      ["property","Лимон по вкусу кислый: O limão ___ azedo.","é","Общее свойство лимона: é azedo."],
      ["state-food","Суп сейчас холодный: A sopa ___ fria.","está","Температура поданного супа — состояние."],
      ["trait-state","Впиши две формы через пробел: O Rui normalmente ___ calmo, mas hoje ___ nervoso.","é está","Характеристика: é calmo; состояние в конкретной ситуации: está nervoso."],
    ]),
];
