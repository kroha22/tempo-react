import { grammarLesson as lesson } from "./gramatica-lesson-factory.ts";
import { shortGrammarLessons } from "./short-grammar-lessons.ts";

function foundation(id: string) {
  const source = shortGrammarLessons.find((item) => item.id === id);
  if (!source) throw new Error(`Missing grammar foundation: ${id}`);
  return source;
}
const now = foundation("estar-a"), ar = foundation("present-ar"), er = foundation("present-er");
const irregular = foundation("present-er-irregular"), ir = foundation("present-ir"), special = foundation("present-ir-special");
const habit = foundation("habit-now"), ter = foundation("ter");

/** Additional adult practice; foundations and vocabulary keep their existing IDs. */
export const presentGrammarLessons = [
  lesson("action-in-progress", 4, "Что происходит сейчас", "Я могу описать действие в процессе через ESTAR A.",
    now.rule, now.examples, [], ["ESTAR из U02", "инфинитивы знакомых действий"], [
      ["we", "Сейчас мы читаем: Nós ___ a ler.", "estamos", "С nós: estamos a ler.", ["estão", "somos"]],
      ["they", "Сейчас они работают: Eles ___ a trabalhar.", "estão", "С eles: estão a trabalhar.", ["está", "são"]],
      ["infinitive", "Что верно: «Я сейчас пишу»?", "Estou a escrever.", "После estou a остаётся инфинитив escrever.", ["Estou a escrevo.", "Sou a escrever."]],
      ["rain", "Выбери описание дождя прямо сейчас.", "Está a chover.", "У погоды безличная форма está.", ["Estão a chover.", "É a chover."]],
      ["you", "Впиши ESTAR A + ESTUDAR: Tu ___ português neste momento.", "estás a estudar", "Tu estás a + инфинитив."],
      ["she", "Впиши ESTAR A + COMER: Agora, a Ana ___.", "está a comer", "Изменяется estar, comer остаётся инфинитивом."],
    ], [
      ["negative", "Впиши ESTAR A + LER: Agora, eu não ___ o jornal.", "estou a ler", "Отрицание стоит перед всей конструкцией: não estou a ler."],
      ["conversation", "Впиши ESTAR A + CONVERSAR: Nós ___ agora.", "estamos a conversar", "Nós estamos a conversar — мы сейчас разговариваем."],
      ["repair", "Исправь только ошибочную часть: Eles estão a trabalham. Введи всю фразу.", "Eles estão a trabalhar.", "После a требуется trabalhar, не trabalham."],
      ["phone", "Впиши ESTAR A + TELEFONAR: Neste momento, eu ___.", "estou a telefonar", "Для другого действия сохраняется та же схема."],
    ], [
      ["write-we", "Впиши ESTAR A + ESCREVER: Neste momento, nós ___.", "estamos a escrever", "Nós estamos a escrever — пишем сейчас."],
      ["eat-they", "Впиши ESTAR A + COMER: Agora, eles ___.", "estão a comer", "Eles estão a comer — едят сейчас."],
      ["read-you", "Впиши ESTAR A + LER: Tu ___ agora.", "estás a ler", "Tu estás a ler."],
      ["snow", "Впиши ESTAR A + NEVAR: Neste momento, ___.", "está a nevar", "О погоде: está a nevar, единственное число."],
      ["transfer", "Впиши ESTAR A + TRABALHAR: Agora, eu ___.", "estou a trabalhar", "Переносим конструкцию на работать: estou a trabalhar."],
    ]),
  lesson("everyday-ar", 5, "Повседневные действия · -AR", "Я могу рассказать о повседневных занятиях с правильными -AR.",
    ar.rule, ar.examples, [], ["лица настоящего времени", "знакомые глаголы -AR"], [
      ["live", "Впиши MORAR: Nós ___ em Braga.", "moramos", "Nós: основа mor- + amos.", ["moro", "moram"]],
      ["talk", "Впиши FALAR: Tu ___ português.", "falas", "Tu: -as.", ["fala", "falam"]],
      ["work", "Впиши TRABALHAR: Eles ___ em casa.", "trabalham", "Eles: -am.", ["trabalha", "trabalhamos"]],
      ["take", "Tomo um café. Здесь tomar означает…", "Пить кофе", "У одного глагола разные значения в сочетаниях.", ["Ловить автобус", "Говорить по телефону"]],
      ["phone", "Впиши TELEFONAR: Eu ___ todos os dias.", "telefono", "Eu telefono — я звоню."],
      ["buy", "Впиши COMPRAR: A Ana ___ pão de manhã.", "compra", "A Ana: форма ele/ela, -a."],
    ], [
      ["bus", "Впиши APANHAR: Nós ___ o autocarro às oito.", "apanhamos", "Apanhar o autocarro — сесть на автобус; nós apanhamos."],
      ["shower", "Впиши TOMAR: Tu ___ duche de manhã.", "tomas", "Tomar duche — принимать душ; tu tomas."],
      ["play", "Впиши JOGAR: Eles ___ futebol ao sábado.", "jogam", "Обычное занятие: eles jogam."],
      ["sun", "Впиши APANHAR: Ela ___ sol na praia.", "apanha", "Apanhar sol — загорать, не ловить транспорт."],
      ["planned", "Amanhã telefono-te. Может ли presente обозначать запланированное действие завтра?", "Да, если это ясно из контекста", "Presente выражает не только привычки, но и факты и запланированное будущее.", ["Нет, presente бывает только прямо сейчас", "Нет, обязательно нужна форма прошлого"]],
    ], [
      ["study", "Впиши ESTUDAR: Nós ___ português à noite.", "estudamos", "Nós estudamos: -amos."],
      ["buy-you", "Впиши COMPRAR: Tu ___ pão aqui.", "compras", "Tu compras: -as."],
      ["live-they", "Впиши MORAR: A Ana e o Rui ___ no Porto.", "moram", "Два человека: eles moram."],
      ["phone-she", "Впиши TELEFONAR: A Rita ___ à mãe todos os dias.", "telefona", "A Rita telefona — она звонит."],
      ["work-i", "Впиши TRABALHAR: Eu ___ de manhã.", "trabalho", "Eu trabalho: -o, перенос в новый контекст."],
    ]),
  lesson("everyday-er", 6, "Еда и учёба · -ER", "Я могу использовать правильные -ER и заметить особую форму CONHECER.",
    `${er.rule} Особые формы eu: conheço, desço, esqueço, aqueço, pareço, abranjo, protejo. Не все слова подборки полностью регулярны. Chover в обычном описании погоды безличен: chove.`, er.examples, [], ["presente -AR", "лица и знакомая лексика еды"], [
      ["drink", "Впиши BEBER: Tu ___ água.", "bebes", "Tu: -es.", ["bebe", "bebemos"]],
      ["live", "Впиши VIVER: Nós ___ em Faro.", "vivemos", "Nós: -emos.", ["vivem", "vivo"]],
      ["write", "Впиши ESCREVER: Eles ___ emails.", "escrevem", "Eles: -em.", ["escreve", "escrevemos"]],
      ["weather", "Идёт дождь. Выбери форму CHOVER для погоды.", "Chove.", "Безличное chover имеет форму третьего лица единственного числа.", ["Chovem.", "Chovemos."]],
      ["eat", "Впиши COMER: Eu ___ sopa ao almoço.", "como", "Eu como — я ем."],
      ["learn", "Впиши APRENDER: A Ana ___ português.", "aprende", "Ela aprende: -e."],
    ], [
      ["receive", "Впиши RECEBER: Nós ___ uma carta.", "recebemos", "Nós recebemos: -emos."],
      ["understand", "Впиши COMPREENDER: Tu ___ a pergunta.", "compreendes", "Tu compreendes: -es."],
      ["know", "Особая форма. Впиши CONHECER: Eu ___ a Ana.", "conheço", "У conhecer с eu форма conheço; это знакомство с человеком."],
      ["contrast", "Впиши BEBER: Eles ___ chá à tarde.", "bebem", "Eles bebem: -em, не -am."],
      ["descend", "DESCER — спускаться. Впиши форму eu: Eu ___ as escadas.", "desço", "Eu desço: особая форма на -ço."],
      ["forget", "ESQUECER — забывать. Впиши форму eu: Eu ___ sempre o nome.", "esqueço", "Eu esqueço, с ç перед o."],
      ["warm", "AQUECER — нагревать. Впиши форму eu: Eu ___ a sopa.", "aqueço", "Eu aqueço, с ç перед o."],
      ["seem", "PARECER — казаться. Впиши форму eu: Eu ___ cansado.", "pareço", "Eu pareço: -ço."],
      ["include", "ABRANGER — охватывать. Впиши форму eu: Eu ___ vários temas.", "abranjo", "Eu abranjo: g → j перед o."],
      ["protect", "PROTEGER — защищать. Впиши форму eu: Eu ___ os meus filhos.", "protejo", "Eu protejo: g → j перед o."],
    ], [
      ["eat-we", "Впиши COMER: Nós ___ em casa.", "comemos", "Nós comemos: -emos."],
      ["write-i", "Впиши ESCREVER: Eu ___ uma carta.", "escrevo", "Eu escrevo: -o."],
      ["receive-you", "Впиши RECEBER: Tu ___ mensagens todos os dias.", "recebes", "Tu recebes: -es."],
      ["learn-they", "Впиши APRENDER: Os alunos ___ depressa.", "aprendem", "Eles aprendem: -em."],
      ["know-transfer", "Впиши CONHECER: Eu ___ bem esta cidade.", "conheço", "Conheço — особая форма знакомства или знания места."],
    ]),
  lesson("irregular-er-use", 7, "Неправильные -ER в разговоре", "Я могу выбрать частые неправильные формы в повседневной ситуации.",
    `${irregular.rule} Дополнительно: eu sei, posso, perco, ponho; eles leem, veem, põem. Saber может обозначать знание факта или умение: sei ler.`, irregular.examples, [], ["лица настоящего времени", "значения saber из словаря"], [
      ["read", "Впиши LER: Eu ___ o jornal de manhã.", "leio", "Eu leio, не leo.", ["leo", "lê"]],
      ["see", "Впиши VER: A Ana ___ o mar.", "vê", "Ela vê; акцент сохраняется.", ["vejo", "veem"]],
      ["do", "Впиши FAZER: Eu ___ o almoço.", "faço", "Eu faço — особая форма.", ["fazo", "faz"]],
      ["say", "Впиши DIZER: Tu ___ a verdade.", "dizes", "Tu dizes; eu digo.", ["digo", "diz"]],
      ["bring", "Впиши TRAZER: Nós ___ pão.", "trazemos", "Nós trazemos — мы приносим."],
      ["know", "Впиши SABER: Eu ___ onde fica o hotel.", "sei", "Saber факта: eu sei."],
    ], [
      ["can", "Впиши PODER: Hoje, eu não ___ sair.", "posso", "Eu posso; depois de poder инфинитив sair."],
      ["want", "Впиши QUERER: Nós ___ um café.", "queremos", "Nós queremos — мы хотим."],
      ["lose", "Впиши PERDER: Eu ___ sempre a chave.", "perco", "Особая форма eu perco."],
      ["put", "Впиши PÔR: Eles ___ a mesa.", "põem", "Eles põem; pôr a mesa — накрывать на стол."],
    ], [
      ["read-they", "Впиши LER: Os meus amigos ___ muito.", "leem", "Eles leem — без циркумфлекса в современном написании."],
      ["see-they", "Впиши VER: Eles ___ o comboio.", "veem", "Eles veem; не vêm от VIR."],
      ["do-they", "Впиши FAZER: A Ana e o Rui ___ o jantar.", "fazem", "Eles fazem."],
      ["know-how", "Впиши SABER: A Rita ___ nadar.", "sabe", "Saber + infinitivo обозначает умение, ela sabe."],
      ["say-i", "Впиши DIZER: Eu ___ sempre a verdade.", "digo", "В новом контексте сохраняется особая форма eu digo."],
    ]),
  lesson("ir-alternations", 8, "-IR: действия и чередования", "Я могу различить регулярные -IR и частые чередования основы.",
    `${ir.rule} Опорные формы: visto, sinto, prefiro, consigo, corrijo. С tu: vestes, sentes, preferes, consegues, corriges. Не переносим чередование eu на все лица. Другие формы eu: dispo, sigo, dirijo, sirvo; у глаголов на -uzir третье лицо заканчивается на z: traduz, conduz.`, ir.examples, [], ["правильные окончания presente", "инфинитивы из подборки U08"], [
      ["open", "Впиши ABRIR: Nós ___ a janela.", "abrimos", "Nós: -imos.", ["abremos", "abrem"]],
      ["prefer", "Впиши PREFERIR: Eu ___ chá.", "prefiro", "Eu prefiro — чередование e → i.", ["prefero", "prefere"]],
      ["feel", "Впиши SENTIR: Tu ___ frio.", "sentes", "С tu — sentes; sinto относится к eu.", ["sinto", "sente"]],
      ["leave", "Впиши PARTIR: Eles ___ amanhã.", "partem", "Eles partem: -em. Presente может обозначать запланированный отъезд.", ["partimos", "parto"]],
      ["dress", "Впиши VESTIR: Eu ___ uma camisa.", "visto", "Eu visto — особая гласная основы."],
      ["manage", "Впиши CONSEGUIR: Eu ___ abrir a porta.", "consigo", "Eu consigo + инфинитив."],
    ], [
      ["decide", "Впиши DECIDIR: Nós ___ juntos.", "decidimos", "Nós decidimos — правильное -imos."],
      ["correct", "Впиши CORRIGIR: Eu ___ os exercícios.", "corrijo", "Eu corrijo: g меняется на j перед o."],
      ["discuss", "Впиши DISCUTIR: Eles ___ o problema.", "discutem", "Eles discutem — правильное -em."],
      ["prefer-you", "Впиши PREFERIR: Tu ___ café.", "preferes", "С tu остаётся preferes, не prefires."],
      ["undress", "DESPIR — снимать одежду. Впиши форму eu: Eu ___ o casaco.", "dispo", "Eu dispo, но tu despes."],
      ["follow", "SEGUIR — следовать. Впиши форму eu: Eu ___ as instruções.", "sigo", "Eu sigo, но tu segues."],
      ["direct", "DIRIGIR — руководить. Впиши форму eu: Eu ___ a escola.", "dirijo", "Eu dirijo: g → j перед o."],
      ["serve", "SERVIR — подавать. Впиши форму eu: Eu ___ o café.", "sirvo", "Eu sirvo, но tu serves."],
      ["translate", "TRADUZIR — переводить. Впиши форму ela: Ela ___ o texto.", "traduz", "У traduzir третье лицо единственного числа оканчивается на z."],
      ["drive", "CONDUZIR — водить. Впиши форму ele: Ele ___ bem.", "conduz", "Ele conduz: окончание z без e."],
    ], [
      ["feel-i", "Впиши SENTIR: Hoje, eu ___ calor.", "sinto", "Eu sinto — чередование основы."],
      ["dress-you", "Впиши VESTIR: Tu ___ uma camisola.", "vestes", "Tu vestes, не vistes."],
      ["correct-you", "Впиши CORRIGIR: Tu ___ o texto.", "corriges", "С tu: corriges; corrijo только с eu."],
      ["open-they", "Впиши ABRIR: As lojas ___ às nove.", "abrem", "Elas abrem."],
      ["manage-transfer", "Впиши CONSEGUIR: Eu não ___ dormir.", "consigo", "Eu consigo + dormir: перенос на другое действие."],
    ]),
  lesson("movement-and-requests", 9, "Движение, просьбы и другие -IR", "Я могу использовать частые особые формы движения и просьб.",
    `${special.rule} Также: eu saio, durmo, subo, fujo, rio; nós saímos, caímos. Eles vêm (VIR) отличается от veem (VER). У construir и destruir особые формы: tu constróis, eles destroem; но tu distribuis, ela substitui. Ouvir означает слышать или слушать; в pt-PT допустимы eu ouço и eu oiço.`, special.examples, [], ["формы настоящего времени", "словарные значения ouvir"], [
      ["go", "Впиши IR: Nós ___ ao mercado.", "vamos", "Nós vamos — мы идём.", ["vão", "vou"]],
      ["come", "Впиши VIR: Eles ___ de Braga.", "vêm", "Eles vêm — приходят/приезжают. Нужен циркумфлекс.", ["vem", "veem"]],
      ["hear", "Впиши OUVIR: Eu ___ um barulho.", ["ouço", "oiço"], "В pt-PT допустимы ouço и oiço — я слышу.", ["ouvo", "ouve"]],
      ["ask", "Впиши PEDIR: Eu ___ ajuda.", "peço", "Eu peço — я прошу.", ["pedo", "pede"]],
      ["sleep", "Впиши DORMIR: Eu ___ bem.", "durmo", "Eu durmo, но tu dormes."],
      ["up", "Впиши SUBIR: Eu ___ as escadas.", "subo", "Eu subo — я поднимаюсь."],
    ], [
      ["run-away", "Впиши FUGIR: Eu ___ do perigo.", "fujo", "Eu fujo: g → j перед o."],
      ["laugh", "Впиши RIR: Eu ___ muito.", "rio", "Eu rio — я смеюсь."],
      ["leave", "Впиши SAIR: Eu ___ às seis.", "saio", "Eu saio — я выхожу."],
      ["fall", "Впиши CAIR: Eu ___ muitas vezes.", "caio", "Eu caio — я падаю."],
      ["distribute", "DISTRIBUIR — раздавать. Впиши форму tu: Tu ___ os livros.", "distribuis", "Tu distribuis: без акцента на i."],
      ["build", "CONSTRUIR — строить. Впиши форму tu: Tu ___ uma casa.", "constróis", "Tu constróis: у construir особая форма с ó."],
      ["destroy", "DESTRUIR — разрушать. Впиши форму eles: Eles ___ a casa.", "destroem", "Eles destroem: особая форма, без акцента."],
      ["replace", "SUBSTITUIR — заменять. Впиши форму ela: Ela ___ o professor.", "substitui", "Ela substitui: не следует шаблону constrói."],
    ], [
      ["come-you", "Впиши VIR: Tu ___ comigo?", "vens", "Tu vens — ты идёшь со мной?"],
      ["listen-we", "Впиши OUVIR: Nós ___ música à noite.", "ouvimos", "Ouvir música — слушать музыку; nós ouvimos."],
      ["ask-you", "Впиши PEDIR: Tu ___ um café.", "pedes", "Tu pedes, а не peço."],
      ["leave-we", "Впиши SAIR: Nós ___ de casa às oito.", "saímos", "Nós saímos: акцент на í сохраняется."],
      ["come-transfer", "Впиши VIR: Os meus amigos ___ cá hoje.", "vêm", "Eles vêm — множественное число VIR, не vêem и не veem."],
    ]),
  lesson("habit-and-current-action", 10, "Обычно или прямо сейчас", "Я могу выбрать обычное действие или процесс в текущей ситуации.",
    `${habit.rule} Время выбираем по смыслу, а не по одному слову: hoje может описывать и план/распорядок, и текущий процесс. Neste momento estamos a estudar — процесс; normalmente estudamos à noite — привычка.`, habit.examples, [], ["U04 ESTAR A", "presente U05–U09"], [
      ["routine", "Обычный распорядок: Todos os dias, eu ___ às oito.", "trabalho", "Presente описывает привычное занятие.", ["estou a trabalhar agora", "sou a trabalhar"]],
      ["phone", "Он не может ответить: прямо сейчас ___.", "está a trabalhar", "Контекст текущего процесса, а не регулярности.", ["trabalha todos os dias", "é a trabalhar"]],
      ["meaning", "Normalmente leio à noite. Это…", "Обычная привычка", "Leio описывает повторяющееся занятие.", ["Обязательно чтение прямо сейчас", "Только вчерашнее событие"]],
      ["marker", "Достаточно ли одного hoje, чтобы всегда выбрать ESTAR A?", "Нет, нужен смысл ситуации", "Hoje не гарантирует процесс прямо сейчас.", ["Да, всегда", "Hoje запрещает ESTAR A"]],
      ["we-now", "Впиши ESTAR A + LER: Neste momento, nós ___.", "estamos a ler", "Прямо сейчас мы читаем."],
      ["she-habit", "Впиши COMER в presente: Normalmente, a Ana ___ em casa.", "come", "Обычное действие, ela come."],
    ], [
      ["write", "Впиши ESTAR A + ESCREVER: Не мешай: eu ___ um email neste momento.", "estou a escrever", "Текущий процесс: estou a escrever."],
      ["work", "Впиши TRABALHAR в presente: Nós ___ aqui todas as semanas.", "trabalhamos", "Повторение по неделям: trabalhamos."],
      ["repair", "Исправь: Agora, eles estão a comem. Введи всё предложение.", ["Agora, eles estão a comer.", "Agora eles estão a comer."], "Процесс: estão a + инфинитив comer."],
      ["today", "Сегодня рабочий день по расписанию, не описание действия в эту секунду. Впиши TRABALHAR в presente: Hoje, eu ___ em casa.", "trabalho", "Hoje допускает presente для сегодняшнего распорядка."],
      ["want-now", "Вырази нынешнее желание в обычной форме QUERER: Agora, eu ___ um café.", "quero", "Желание здесь естественно выражается presente, даже с agora."],
      ["know-now", "Сейчас я знаю ответ. Впиши SABER в presente: Agora, eu ___ a resposta.", "sei", "Знание здесь выражаем простой формой sei, а не ESTAR A."],
      ["prefer-now", "Сейчас я предпочитаю чай. Впиши PREFERIR в presente: Agora, eu ___ chá.", "prefiro", "Нынешнее предпочтение здесь выражается presente."],
    ], [
      ["regular", "Впиши LER в presente: Habitualmente, eles ___ à noite.", "leem", "Обычная привычка: eles leem."],
      ["process", "Впиши ESTAR A + COMER: Не звоните: nós ___ agora.", "estamos a comer", "Процесс, из-за которого нельзя ответить."],
      ["you", "Впиши ESTUDAR в presente: Tu ___ todos os dias.", "estudas", "Регулярность: tu estudas."],
      ["she-now", "Впиши ESTAR A + TELEFONAR: Neste momento, a Rita ___.", "está a telefonar", "A Rita está a telefonar — звонит сейчас."],
      ["transfer", "Сегодня я описываю прямо текущий процесс. Впиши ESTAR A + TRABALHAR: Hoje, neste momento, eu ___.", "estou a trabalhar", "Контекст требует процесс, а не само слово hoje."],
    ]),
  lesson("possession-age-and-sensations", 11, "TER: возраст, вещи и ощущения", "Я могу сообщить возраст, владение и ощущения через TER.",
    ter.rule, ter.examples, [], ["личные формы", "семья и состояния"], [
      ["i", "Впиши TER: Eu ___ uma irmã.", "tenho", "Eu tenho — у меня есть.", ["tem", "têm"]],
      ["they", "Впиши TER: Eles ___ dois filhos.", "têm", "Eles têm; циркумфлекс отличает множественное число.", ["tem", "tenho"]],
      ["age", "Мне 30 лет. Какая конструкция верна?", "Tenho 30 anos.", "Возраст выражается TER, не SER.", ["Sou 30 anos.", "Estou 30 anos."]],
      ["hunger", "Я голоден/голодна. Выбери фразу с TER.", "Tenho fome.", "TER + fome обозначает голод.", ["Sou fome.", "Tenho faminto."]],
      ["you", "Впиши TER: Tu ___ tempo hoje?", "tens", "Tu tens — у тебя есть."],
      ["we", "Впиши TER: Nós ___ frio.", "temos", "Nós temos frio — нам холодно."],
    ], [
      ["fear", "Впиши TER: A Ana ___ medo.", "tem", "Один человек: ela tem."],
      ["thirst", "Впиши TER: Eu ___ sede.", "tenho", "Tenho sede — хочу пить."],
      ["answer", "Ответь целой фразой с TER: Quantos anos tens? Тебе 25 лет.", "Tenho 25 anos.", "На вопрос tens отвечаем от eu: tenho."],
      ["negative", "Впиши TER: Eu não ___ carro.", "tenho", "Отрицание перед глаголом: não tenho."],
    ], [
      ["children", "Впиши TER: A Ana e o Rui ___ uma filha.", "têm", "Два человека: eles têm."],
      ["age-you", "Впиши TER: Quantos anos ___ tu?", "tens", "Вопрос с tu: tens."],
      ["possession", "Впиши TER: Nós ___ um livro.", "temos", "Nós temos — у нас есть."],
      ["feeling", "Впиши TER: A Rita ___ calor.", "tem", "Ela tem calor — ей жарко."],
      ["contrast", "Впиши две формы TER через пробел: Ela ___ tempo, mas eles não ___.", "tem têm", "Ela tem / eles têm: число различается и на письме."],
    ]),
];
