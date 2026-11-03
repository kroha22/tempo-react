/** Authored pt-PT adaptations; source unit numbers are aliases, never progress IDs. */
import { grammarLesson as lesson } from "./gramatica-lesson-factory.ts";
import { presentGrammarLessons } from "./gramatica-present.ts";
import { foundationGrammarLessons } from "./gramatica-foundations.ts";
import { mixedGrammarReview } from "./gramatica-mixed-review.ts";
export type GrammarStage = "diagnostic" | "guided" | "exit";
export type GrammarTask = {
  id: string; stage: GrammarStage; prompt: string; answers: string[];
  options?: string[]; explanation: string; target: string; critical?: boolean;
};
export type GrammarLesson = {
  id: string; slug: string; unit: number; title: string; canDo: string; rule: string;
  examples: { pt: string; ru: string }[];
  vocabulary: { slug: string; pt: string; ru: string; example: string; exampleRu: string }[];
  review: string[]; tasks: GrammarTask[];
  checkpoint?: boolean;
};
export const gramaticaLessons: GrammarLesson[] = [
  lesson("past-background", 18, "Возраст, часы и параллельные действия",
    "Я могу назвать возраст и время в прошлом и описать два одновременных действия.",
    "Imperfeito описывает условия и действия в развитии. Возраст: tinha … anos. Часы: era uma hora / era meia-noite, но eram duas horas. Enquanto связывает одновременные процессы; это не последовательность событий.",
    [{ pt: "Quando tinha seis anos, vivia no Porto.", ru: "Когда мне было шесть лет, я жил(а) в Порту." }, { pt: "Enquanto eu lia, a Ana escrevia.", ru: "Пока я читал(а), Ана писала." }],
    [{ slug: "enquanto", pt: "enquanto", ru: "пока; в то время как", example: "Enquanto eu lia, a Ana escrevia.", exampleRu: "Пока я читал(а), Ана писала." },
      { slug: "meia-noite", pt: "à meia-noite", ru: "в полночь", example: "À meia-noite, eu dormia.", exampleRu: "В полночь я спал(а)." },
      { slug: "ter-anos", pt: "ter … anos", ru: "быть в возрасте … лет", example: "A Ana tinha oito anos.", exampleRu: "Ане было восемь лет." },
      { slug: "fazer-cama", pt: "fazer a cama", ru: "застилать постель", example: "Eu fazia a cama.", exampleRu: "Я застилал(а) постель." }],
    ["ter, ser: imperfeito", "ler, escrever, estudar", "числительные и часы"],
    [
      ["age", "Возраст в прошлом: Quando eu ___ oito anos, vivia em Braga.", "tinha", "Возраст выражаем TER в imperfeito: tinha oito anos.", ["era", "tenho"]],
      ["one", "Часы в прошлом: ___ uma hora da manhã.", "Era", "С uma hora — единственное число era.", ["Eram", "São"]],
      ["many", "Часы в прошлом: ___ quatro horas.", "Eram", "С quatro horas — множественное число eram.", ["Era", "É"]],
      ["parallel", "Enquanto eu lia, a Ana escrevia. Как связаны действия?", "Происходили одновременно", "Enquanto соединяет два процесса в развитии.", ["Ана начала только после чтения", "Оба действия произойдут завтра"]],
      ["write-age", "Впиши TER в imperfeito: Quando eu ___ dez anos, estudava aqui.", "tinha", "Eu tinha dez anos — мне было десять лет."],
      ["write-read", "Впиши LER в imperfeito: Enquanto a Ana ___, eu escrevia.", "lia", "A Ana lia — Ана читала в тот же момент."],
    ], [
      ["midnight", "Впиши SER в imperfeito: ___ meia-noite quando chegámos.", "Era", "Meia-noite требует единственного числа: era."],
      ["table", "Впиши PÔR в imperfeito: Enquanto eu cozinhava, o Rui ___ a mesa.", "punha", "Pôr → ele punha; два действия происходили одновременно."],
      ["relation", "Eu fazia a cama enquanto a Ana lia. Выбери схему.", "Я застилал(а) постель, а Ана в это время читала", "Здесь два параллельных процесса, без указания, какой начался раньше.", ["Сначала постель, затем чтение", "Сначала чтение, затем постель"]],
      ["two", "Впиши SER в imperfeito: Quando a aula acabou, ___ duas horas.", "eram", "Duas horas — множественное число eram."],
    ], [
      ["childhood", "Впиши TER в imperfeito: Quando a Rita ___ nove anos, vivia em Faro.", "tinha", "A Rita tinha nove anos — Рите было девять лет."],
      ["clock", "Впиши SER в imperfeito: Nesse momento, ___ cinco horas.", "eram", "Cinco horas требует eram."],
      ["noon", "Впиши SER в imperfeito: ___ meio-dia quando saímos.", "Era", "Meio-dia — единственное число: era."],
      ["simultaneous", "Enquanto o Rui estudava, a Rita ouvia música. Что верно?", "Руй занимался, а Рита в это время слушала музыку", "Две формы imperfeito обозначают параллельные процессы.", ["Рита слушала музыку только после занятий Руя", "Руй ещё не начал заниматься"]],
      ["produce-parallel", "Два процесса одновременно. Впиши ESCREVER в imperfeito: Enquanto eu lia, ela ___.", "escrevia", "Ela escrevia: действие в развитии одновременно с lia."],
    ]),
  lesson("background-event", 19, "Что происходило и что случилось",
    "Я могу связать фон в прошлом с наступившим событием.",
    "Imperfeito показывает привычку или фон в развитии; perfeito представляет событие как целое. Дело не в длине действия. В Eu lia quando a Ana chegou чтение уже происходило в момент прихода. Depois / затем обозначает последующее событие.",
    [{ pt: "Eu estava a ler quando o telefone tocou.", ru: "Я читал(а), когда зазвонил телефон." }, { pt: "Ontem li um livro.", ru: "Вчера я прочитал(а) книгу." }],
    [{ slug: "de-repente", pt: "de repente", ru: "вдруг", example: "De repente, o telefone tocou.", exampleRu: "Вдруг зазвонил телефон." },
      { slug: "bater-porta", pt: "bater à porta", ru: "стучать в дверь", example: "Alguém bateu à porta.", exampleRu: "Кто-то постучал в дверь." },
      { slug: "apagar-luz", pt: "a luz apagou-se", ru: "свет погас", example: "Enquanto eu lia, a luz apagou-se.", exampleRu: "Пока я читал(а), свет погас." },
      { slug: "atender-telefone", pt: "atender o telefone", ru: "ответить на телефонный звонок", example: "O telefone tocou e eu atendi.", exampleRu: "Телефон зазвонил, и я ответил(а)." }],
    ["perfeito U12–14", "imperfeito U16–18", "quando, enquanto, ler, chegar"],
    [
      ["tv", "Фон: Eu ___ televisão quando a Maria chegou.", "via", "Телевизор уже смотрели в момент прихода.", ["vi", "vejo"]],
      ["knock", "Разовое событие вчера: De repente, alguém ___ à porta.", "bateu", "В данном рассказе стук — наступившее событие.", ["bate", "bater"]],
      ["habit", "Привычка в детстве: Quando era pequeno, ___ todos os dias.", "jogava", "Todos os dias в этом контексте описывает привычку.", ["joguei", "jogo"]],
      ["overlap", "Eu lia quando ela entrou. Что верно?", "Она вошла во время чтения", "Вход произошёл на фоне чтения.", ["Чтение началось только после её входа", "Она войдёт завтра"]],
      ["enter", "Впиши ENTRAR в perfeito: Eu estava a ler quando ela ___.", "entrou", "Ela entrou — наступившее событие на фоне чтения."],
      ["study", "Впиши ESTUDAR в imperfeito: Enquanto eu ___, o telefone tocou.", "estudava", "Eu estudava — процесс, во время которого зазвонил телефон."],
    ], [
      ["dinner", "Впиши JANTAR в imperfeito: Enquanto nós ___, a luz apagou-se.", "jantávamos", "Nós jantávamos — мы ужинали; ударение сохраняется."],
      ["sequence", "Я работал; зазвонил телефон; затем ответил. Что происходит на фоне работы?", "Звонок телефона", "Работа пересекается со звонком; ответ следует за звонком.", ["Работа начинается только после ответа", "Все события строго одно за другим без пересечения"]],
      ["habit-fix", "Исправь только форму IR для привычки: Quando era pequena, eu fui à escola todos os dias.", "ia", "Для привычки в этом контексте: eu ia à escola."],
      ["read", "Впиши LER в imperfeito: Ele ___ quando a Ana chegou.", "lia", "Ele lia — фоновый процесс, chegou — событие."],
    ], [
      ["sleep", "Впиши DORMIR в imperfeito: Eu ___ quando o telefone tocou.", "dormia", "Сон был фоном для звонка."],
      ["arrive", "Впиши CHEGAR в perfeito: Nós estávamos a jantar quando o Rui ___.", "chegou", "Приход Руя — событие во время ужина."],
      ["used-to", "Впиши IR в imperfeito: Na infância, ela ___ a pé para a escola todos os dias.", "ia", "Речь о привычном способе добираться в детстве."],
      ["relation", "A Ana escrevia quando a luz se apagou. Что случилось во время письма?", "Погас свет", "Письмо — фон, apagou-se / se apagou после quando — событие.", ["Ана начала писать после отключения", "Свет погаснет завтра"]],
      ["contrast", "Впиши TOCAR в perfeito: Enquanto a Rita estudava, o telefone ___.", "tocou", "Tocou обозначает наступивший звонок на фоне учёбы."],
    ]),
  lesson("polite-requests", 20, "Вежливые просьбы и пожелания",
    "Я могу вежливо попросить помощь или заказать что-нибудь через imperfeito.",
    "Queria, podia, gostava de могут смягчать нынешнюю просьбу или пожелание. Контекст важен: gostava de без него может описывать и прошлую привычку. Здесь целенаправленно тренируем imperfeito de cortesia. Прямое quero само по себе не делает просьбу неправильной.",
    [{ pt: "Queria um café, por favor.", ru: "Я бы хотел(а) кофе, пожалуйста." }, { pt: "Podia dizer-me onde fica a estação?", ru: "Не могли бы вы сказать, где находится станция?" }],
    [{ slug: "por-favor", pt: "por favor", ru: "пожалуйста", example: "Queria uma água, por favor.", exampleRu: "Я бы хотел(а) воды, пожалуйста." },
      { slug: "ajudar-me", pt: "ajudar-me", ru: "помочь мне", example: "Podia ajudar-me?", exampleRu: "Не могли бы вы мне помочь?" },
      { slug: "dar-informacao", pt: "dar uma informação", ru: "дать информацию; подсказать", example: "Podia dar-me uma informação?", exampleRu: "Не могли бы вы мне подсказать?" },
      { slug: "gostava-de", pt: "gostava de…", ru: "мне хотелось бы… (в контексте пожелания)", example: "Gostava de visitar Coimbra nas próximas férias.", exampleRu: "Мне хотелось бы посетить Коимбру в следующий отпуск." }],
    ["querer, poder, gostar de", "água, café", "onde fica"],
    [
      ["order", "В кафе сейчас. Выбери заказ именно с imperfeito de cortesia.", "Queria um café, por favor.", "Queria — imperfeito, смягчающий нынешний заказ.", ["Quero um café, por favor.", "Vou beber um café."]],
      ["help", "Вежливая просьба сейчас: ___ ajudar-me? (poder, você, imperfeito)", "Podia", "Você podia ajudar-me? — смягчённая просьба.", ["Pode", "Poder"]],
      ["wish", "Gostava de visitar Faro nas próximas férias. Здесь речь о…", "Нынешнем пожелании на будущий отпуск", "Nas próximas férias задаёт будущее пожелание.", ["Доказанной привычке в детстве", "Завершённой вчера поездке"]],
      ["register", "Какой вариант использует именно imperfeito для нынешней просьбы?", "Podia dizer-me onde fica o hotel?", "Podia — целевая форма imperfeito.", ["Pode dizer-me onde fica o hotel?", "Onde fica o hotel?"]],
      ["write-want", "Впиши QUERER в imperfeito: Eu ___ uma água, por favor.", "queria", "Eu queria — вежливый заказ в настоящей ситуации."],
      ["write-like", "Впиши GOSTAR в imperfeito: Eu ___ de visitar Braga nas próximas férias.", "gostava", "Gostava de + infinitivo выражает пожелание в этом контексте."],
    ], [
      ["ask", "Впиши PODER в imperfeito (você): ___ dar-me uma informação, por favor?", "Podia", "Podia + infinitivo смягчает просьбу."],
      ["prefer", "Впиши PREFERIR в imperfeito: Hoje, eu ___ ficar em casa.", "preferia", "Eu preferia — мягко выраженное нынешнее предпочтение."],
      ["not-rude", "Quero uma água, por favor. Обязательно ли это грубо?", "Нет, но здесь тренируется другая форма: queria", "Quero тоже может быть уместно. Упражнение отдельно требует imperfeito.", ["Да, quero всегда грубо", "Quero — форма imperfeito"]],
      ["rewrite", "Замени только Quero на imperfeito de cortesia: Quero um café, por favor.", "Queria", "Queria um café, por favor — тот же заказ в целевой конструкции."],
    ], [
      ["water", "Заказ сейчас. Впиши QUERER в imperfeito: ___ uma água, por favor.", "Queria", "Queria — вежливая просьба сейчас."],
      ["information", "Впиши PODER в imperfeito (você): ___ informar-me, por favor?", "Podia", "Podia informar-me — смягчённая просьба."],
      ["future-wish", "Нынешнее пожелание: Eu ___ de conhecer o Porto nas próximas férias. (gostar, imperfeito)", "gostava", "Будущий отпуск задаёт контекст нынешнего пожелания."],
      ["recognize", "Выбери просьбу с imperfeito de cortesia.", "Podia ajudar-me, por favor?", "Podia — именно imperfeito; pode тоже вежливо, но другая форма.", ["Pode ajudar-me, por favor?", "Ajude-me, por favor."]],
      ["request", "Впиши PODER в imperfeito (você): ___ dizer-me como chegar à estação?", "Podia", "Podia dizer-me… — просьба подсказать дорогу."],
    ]),
  lesson("earlier-past", 21, "Что произошло раньше",
    "Я могу сказать, что уже произошло до другого события в прошлом.",
    "Mais-que-perfeito composto: TER в imperfeito + причастие. Quando cheguei, o comboio já tinha partido: сначала отправление, затем мой приход. После TER причастие не согласуется с подлежащим: elas tinham saído. Важно иметь две точки в прошлом, одного já недостаточно.",
    [{ pt: "Quando cheguei, o comboio já tinha partido.", ru: "Когда я пришёл(ла), поезд уже ушёл." }, { pt: "Ela não tinha fome porque já tinha almoçado.", ru: "Она не была голодна, потому что уже пообедала." }],
    [{ slug: "ja", pt: "já", ru: "уже", example: "Quando cheguei, a Ana já tinha saído.", exampleRu: "Когда я пришёл(ла), Ана уже ушла." },
      { slug: "antes-de", pt: "antes de", ru: "до; прежде чем", example: "Eu tinha visto o filme antes de falarmos.", exampleRu: "Я посмотрел(а) фильм до нашего разговора." },
      { slug: "ter-partido", pt: "tinha partido", ru: "уже ушёл / отправился до другого момента в прошлом", example: "O comboio já tinha partido quando chegámos.", exampleRu: "Поезд уже ушёл, когда мы пришли." },
      { slug: "ter-acabado", pt: "tinha acabado", ru: "уже закончил(а) до другого момента в прошлом", example: "Eu já tinha acabado quando ela chegou.", exampleRu: "Я уже закончил(а), когда она пришла." }],
    ["ter: tinha, tínhamos, tinham", "chegar, sair, almoçar", "perfeito"],
    [
      ["depart", "Quando cheguei, o comboio já tinha partido. Что раньше?", "Поезд отправился", "Tinha partido предшествует cheguei.", ["Я пришёл на станцию", "Оба события ещё впереди"]],
      ["aux", "Требуется mais-que-perfeito: Eles já ___ saído quando chegámos.", "tinham", "Eles tinham + saído.", ["têm", "tinha"]],
      ["participle", "Причастие SAIR после TER:", "saído", "Sair → saído; диакритика сохраняется.", ["sair", "saíram"]],
      ["meaning", "Ela já tinha almoçado quando saímos. Что произошло позже?", "Мы вышли", "Обед предшествует saímos.", ["Она пообедала", "Ничего не произошло"]],
      ["write-aux", "Впиши TER в imperfeito: Nós já ___ acabado quando ele chegou.", "tínhamos", "Nós tínhamos acabado — мы закончили до его прихода."],
      ["write-part", "Впиши причастие FAZER: Ela já tinha ___ o jantar quando cheguei.", "feito", "После tinha нужно причастие feito, не fazer."],
    ], [
      ["left", "Впиши SAIR в mais-que-perfeito composto: Quando chegámos, eles já ___.", "tinham saído", "Они ушли до нашего прихода."],
      ["lunch", "Впиши ALMOÇAR в mais-que-perfeito composto: Ela não tinha fome porque já ___.", "tinha almoçado", "Обед произошёл раньше описанного состояния."],
      ["agreement", "Выбери форму после TER: Elas já tinham ___ quando cheguei.", "saído", "После TER причастие не согласуется: tinham saído.", ["saídas", "saíram"]],
      ["correct", "Исправь только sair: Quando cheguei, ele tinha sair.", "saído", "Tinha + particípio: tinha saído."],
    ], [
      ["finish", "Впиши ACABAR в mais-que-perfeito composto: Cheguei, mas eles já ___.", "tinham acabado", "Сначала они закончили, затем я пришёл(ла)."],
      ["see", "Впиши причастие VER: Eu tinha ___ o filme antes de falarmos.", "visto", "Ver → visto; просмотр предшествует разговору."],
      ["we", "Впиши TER в imperfeito: Nós já ___ saído quando ela telefonou.", "tínhamos", "Nós tínhamos saído — звонок произошёл позже."],
      ["order", "Quando a Rita chegou, o Rui já tinha feito o jantar. Что раньше?", "Руй приготовил ужин", "Tinha feito обозначает более раннее событие.", ["Рита пришла", "Они ещё только собираются ужинать"]],
      ["earlier", "Впиши PARTIR в mais-que-perfeito composto: Quando chegámos à estação, o comboio já ___.", "tinha partido", "Отправление произошло до нашего прихода на станцию."],
    ]),
  lesson("recent-repetition", 22, "Что происходит в последнее время",
    "Я могу рассказать о повторяющихся или продолжающихся ситуациях до настоящего момента.",
    "Pretérito perfeito composto: TER в presente + причастие. Tenho estudado português ultimamente — последнее время я занимаюсь португальским. Это не универсальное «уже сделал». Fiz ontem — завершённое событие вчера; tinha feito — раньше другого прошлого события. Nós temos, eles têm: диакритика важна.",
    [{ pt: "Ultimamente, tenho estudado português.", ru: "В последнее время я занимаюсь португальским." }, { pt: "Nos últimos dias, eles têm dormido mal.", ru: "В последние дни они плохо спят." }],
    [{ slug: "ultimamente", pt: "ultimamente", ru: "в последнее время", example: "Ultimamente, tenho trabalhado muito.", exampleRu: "В последнее время я много работаю." },
      { slug: "ultimos-dias", pt: "nos últimos dias", ru: "в последние дни", example: "Nos últimos dias, tenho dormido bem.", exampleRu: "В последние дни я хорошо сплю." },
      { slug: "desde-que", pt: "desde que", ru: "с тех пор как", example: "Desde que comecei o curso, tenho estudado todos os dias.", exampleRu: "С тех пор как я начал(а) курс, я занимаюсь каждый день." },
      { slug: "ultimos-tempos", pt: "nos últimos tempos", ru: "в последнее время", example: "Nos últimos tempos, temos lido muito.", exampleRu: "В последнее время мы много читаем." }],
    ["ter: tenho, temos, têm", "причастия U21", "trabalhar, estudar, dormir"],
    [
      ["meaning", "Tenho estudado português ultimamente. Что это значит?", "Последнее время я регулярно занимаюсь португальским", "Повторение в периоде, связанном с настоящим.", ["Я уже полностью выучил португальский", "Я занимался только вчера один раз"]],
      ["yesterday", "Разовое завершённое событие вчера:", "Ontem trabalhei muito.", "Ontem задаёт завершённый период для данного события.", ["Ultimamente, tenho trabalhado muito.", "Quando cheguei, já tinha trabalhado."]],
      ["aux", "Требуется perfeito composto: Eles ___ dormido mal nos últimos dias.", "têm", "Eles têm + dormido.", ["tem", "tinham"]],
      ["not-earlier", "Чем tenho feito отличается от tinha feito?", "Последний период до настоящего, а не раньше другого прошлого события", "Tenho и tinha задают разные временные отношения.", ["Это полностью одинаковые значения", "Tenho feito всегда означает одно событие вчера"]],
      ["write", "Впиши ESTUDAR в perfeito composto: Ultimamente, eu ___ muito.", "tenho estudado", "Eu tenho + estudado: занятия повторяются в последнее время."],
      ["write-we", "Впиши TER в presente: Nos últimos tempos, nós ___ trabalhado muito.", "temos", "Nós temos trabalhado — работа в последнее время."],
    ], [
      ["sleep", "Впиши DORMIR в perfeito composto: Nos últimos dias, eles ___ mal.", "têm dormido", "Eles têm dormido mal — повторяющаяся ситуация до настоящего."],
      ["rain", "В последнее время регулярно идёт дождь:", "Tem chovido muito ultimamente.", "Tem chovido передаёт повторение в нынешнем периоде.", ["Choveu ontem.", "Já tinha chovido quando chegámos."]],
      ["part", "Исправь только trabalhar: Ultimamente, eu tenho trabalhar muito.", "trabalhado", "После tenho требуется причастие trabalhado."],
      ["read", "Впиши LER в perfeito composto: Nos últimos tempos, nós ___ muito.", "temos lido", "Nós temos + lido — мы много читаем последнее время."],
    ], [
      ["work", "Впиши TRABALHAR в perfeito composto: Ultimamente, nós ___ muito.", "temos trabalhado", "Повторяющаяся работа в периоде до настоящего."],
      ["sleep-aux", "Впиши TER в presente: Nos últimos dias, elas ___ dormido bem.", "têm", "Elas têm dormido; têm во множественном числе."],
      ["study", "Впиши ESTUDAR в perfeito composto: Desde que comecei o curso, eu ___ todos os dias.", "tenho estudado", "Ситуация повторяется с начала курса до настоящего."],
      ["contrast", "Как сказать о единственном завершённом обеде вчера?", "Ontem almocei em casa.", "Almocei описывает отдельное событие в завершённом периоде.", ["Ultimamente, tenho almoçado em casa.", "Já tinha almoçado quando ele chegou."]],
      ["repeat", "Впиши LER в perfeito composto: Ultimamente, a Rita ___ muito.", "tem lido", "A Rita tem lido — читает регулярно в последнее время, не «уже всё прочитала»."],
    ]),
  lesson("action-states", 23, "Собираюсь, делаю, только что сделал",
    "Я могу различить намерение, действие сейчас и недавнее завершение.",
    "IR в presente + infinitivo выражает будущее или намерение: vou jantar. ESTAR в presente + a + infinitivo — процесс: estou a jantar. ACABAR в perfeito + de + infinitivo — недавнее завершение: acabei de jantar. Изменяется первый глагол; основной остаётся инфинитивом. IR + infinitivo не ограничивается ближайшими минутами.",
    [{ pt: "Vou jantar. Estou a jantar. Acabei de jantar.", ru: "Собираюсь ужинать. Сейчас ужинаю. Только что поужинал(а)." }, { pt: "A Ana está a ler um livro.", ru: "Ана сейчас читает книгу." }],
    [{ slug: "daqui-pouco", pt: "daqui a pouco", ru: "скоро; через небольшое время", example: "Daqui a pouco, vamos sair.", exampleRu: "Скоро мы выйдем." },
      { slug: "ainda-agora", pt: "ainda agora", ru: "только что (в этом контексте)", example: "Ainda agora acabei de chegar.", exampleRu: "Я только что пришёл(ла)." },
      { slug: "acabar-de", pt: "acabar de + infinitivo", ru: "только что сделать (с acabar в perfeito)", example: "Acabei de estudar.", exampleRu: "Я только что закончил(а) заниматься." },
      { slug: "neste-momento", pt: "neste momento", ru: "в данный момент", example: "Neste momento, estou a ler.", exampleRu: "В данный момент я читаю." }],
    ["ir, estar: presente", "acabar: perfeito", "ler, sair, jantar, estudar"],
    [
      ["future", "Vou jantar. Это…", "Намерение поужинать", "Vou + infinitivo — намерение или будущее.", ["Процесс ужина прямо сейчас", "Только что закончившийся ужин"]],
      ["now", "Estou a jantar. Это…", "Ужинаю сейчас", "Estou a + infinitivo — действие в процессе.", ["Уже только что поужинал", "Только планирую ужинать"]],
      ["recent", "Acabei de jantar. Это…", "Только что поужинал(а)", "Acabei de + infinitivo — недавнее завершение.", ["Ещё собираюсь ужинать", "Ужинаю прямо сейчас"]],
      ["infinitive", "В конструкции estou a основной глагол должен быть…", "В инфинитиве", "Изменяется estar, основной глагол остаётся инфинитивом.", ["В форме eu настоящего времени", "В причастии после ter"]],
      ["write-now", "Впиши LER через ESTAR A: Agora, a Ana ___ um livro.", "está a ler", "A Ana está a ler — процесс сейчас."],
      ["write-future", "Впиши SAIR через IR + infinitivo: Daqui a pouco, nós ___.", "vamos sair", "Nós vamos sair — собираемся выйти."],
    ], [
      ["recent-arrival", "Впиши CHEGAR через ACABAR в perfeito + DE: Eu ___ agora mesmo.", "acabei de chegar", "Acabei de chegar — я только что пришёл(ла)."],
      ["change-future", "Напиши полное предложение через IR + infinitivo: Ela está a estudar. → Она собирается заниматься.", "Ela vai estudar.", "Ela vai + estudar — намерение вместо текущего процесса."],
      ["change-recent", "Напиши полное предложение: Eles vão almoçar. → Они только что пообедали. Используй ACABAR в perfeito + DE.", "Eles acabaram de almoçar.", "Eles acabaram de + almoçar — недавнее завершение."],
      ["states", "Какая фраза описывает действие в процессе?", "Estamos a preparar o jantar.", "Estamos a + infinitivo — готовим прямо сейчас.", ["Vamos preparar o jantar.", "Acabámos de preparar o jantar."]],
    ], [
      ["now-we", "Впиши ESTUDAR через ESTAR A: Neste momento, nós ___.", "estamos a estudar", "Nós estamos a estudar — занимаемся сейчас."],
      ["future-she", "Впиши JANTAR через IR + infinitivo: Daqui a pouco, a Rita ___.", "vai jantar", "A Rita vai jantar — намерение поужинать."],
      ["recent-they", "Впиши SAIR через ACABAR в perfeito + DE: Eles ___ agora mesmo.", "acabaram de sair", "Eles acabaram de sair — только что вышли."],
      ["tomorrow", "Amanhã vou trabalhar em casa. Допустимо ли IR + infinitivo для завтра?", "Да, конструкция не ограничена ближайшими минутами", "IR + infinitivo выражает будущее и намерение, в том числе на завтра.", ["Нет, только для ближайших секунд", "Нет, это всегда действие прямо сейчас"]],
      ["recent-we", "Впиши LER через ACABAR в perfeito + DE: Nós ___ o texto agora mesmo.", "acabámos de ler", "Nós acabámos de ler — только что прочитали; используется pt-PT acabámos."],
    ]),
];

export const allGramaticaLessons = [...foundationGrammarLessons, ...presentGrammarLessons, ...gramaticaLessons, mixedGrammarReview];

export function normalizeGrammarAnswer(value: string) {
  return value.normalize("NFC").trim().toLocaleLowerCase("pt-PT").replace(/\s+/gu, " ").replace(/[.!?…]+$/u, "").trim();
}
export function grammarAnswerCorrect(task: GrammarTask, answer: string) {
  return task.answers.some((key) => normalizeGrammarAnswer(key) === normalizeGrammarAnswer(answer));
}
export function grammarTasks(lesson: GrammarLesson, stage: GrammarStage) { return lesson.tasks.filter((task) => task.stage === stage); }
export function diagnosticPassed(lesson: GrammarLesson, answers: Record<string, string>) {
  const items = grammarTasks(lesson, "diagnostic");
  return items.filter((task) => grammarAnswerCorrect(task, answers[task.id] ?? "")).length >= 5 &&
    items.filter((task) => !task.options).every((task) => grammarAnswerCorrect(task, answers[task.id] ?? ""));
}
export function grammarExitResult(lesson: GrammarLesson, answers: Record<string, string>) {
  const items = grammarTasks(lesson, "exit");
  const correct = items.filter((task) => grammarAnswerCorrect(task, answers[task.id] ?? "")).length;
  return { correct, total: items.length, demonstrated: lesson.checkpoint ? items.every(task=>grammarAnswerCorrect(task,answers[task.id]??"")) : correct >= 4 && items.filter((task) => task.critical).every((task) => grammarAnswerCorrect(task, answers[task.id] ?? "")) };
}
