export const homeFlowPhases=["explanation","words","practice","review"] as const;
export type HomeFlowPhase=typeof homeFlowPhases[number];
export type HomeFlowTopic="rooms"|"objects"|"location";
export const homeFlowHref=(topic:HomeFlowTopic="rooms",phase:HomeFlowPhase="explanation",related?:string)=>`/learning/home?topic=${topic}&phase=${phase}${related?`&related=${encodeURIComponent(related)}`:""}`;
export const homeIntroductions={
  rooms:[
    ["Consigo nomear seis espaços da casa: o quarto, a sala, a cozinha, a casa de banho, o escritório e a garagem.","Я могу назвать шесть помещений дома: спальню, гостиную, кухню, ванную комнату, домашний кабинет и гараж."],
    ["Aqui, a sala é uma divisão da casa e o escritório é um espaço para trabalhar em casa. O quarto é o lugar onde dormimos.","Здесь sala — комната / гостиная, а escritório — место для работы дома. Quarto — спальня."],
    ["Para dizer que existe alguma coisa, usamos HÁ: Há uma mesa na sala. Para dizer o que alguém tem, usamos TER: A Rita tem uma chave.","Чтобы сообщить о наличии чего-то, используем HÁ: в комнате есть стол. Чтобы сказать, что есть у кого-то, используем TER: у Риты есть ключ."],
    ["A primeira prática retoma uma pergunta da nossa aula curta sobre TER e HÁ. A imagem completa tem vinte e quatro legendas: é uma atividade adicional, com um resultado separado.","Первая практика повторяет вопрос из нашего короткого урока TER/HÁ. На полной схеме 24 подписи: это дополнительное задание с отдельным результатом."],
  ],
  objects:[
    ["Consigo reconhecer sete palavras da cena: a mesa, a caixa, a porta, a janela, o gato, a chave e o livro.","Я могу узнать семь слов сцены: стол, коробку, дверь, окно, кота, ключ и книгу."],
    ["Os nomes têm artigo e plural: a porta — as portas; o livro — os livros. O gato é o participante conhecido da cena, não um móvel.","У существительных есть артикль и множественное число: a porta — as portas; o livro — os livros. Кот — знакомый участник сцены, а не мебель."],
    ["A porta está aberta. O gato está dentro da caixa. Uma descrição ajuda a reconhecer o objeto no contexto.","Дверь открыта. Кот внутри коробки. Описание помогает узнать предмет в контексте."],
    ["A prática retoma o artigo e o número. A escrita de móveis e aparelhos usa o conjunto antigo completo; não é uma prova apenas destas sete palavras.","Практика повторяет артикль и число. Письмо мебели и техники использует прежний полный набор; это не проверка только этих семи слов."],
  ],
  location:[
    ["Consigo perguntar Onde está o gato? e indicar a sua posição: dentro de, em cima de, debaixo de ou ao lado de alguma coisa.","Я могу спросить «Где кот?» и назвать его положение: внутри, на поверхности, под или рядом с чем-то."],
    ["O gato está debaixo da mesa. A caixa está ao lado da porta. Usamos ESTAR para indicar onde alguém ou alguma coisa está nesta cena.","Кот под столом. Коробка рядом с дверью. Используем ESTAR, чтобы указать положение человека или предмета в этой сцене."],
    ["De junta-se ao artigo: de + a = da, de + o = do. Dizemos dentro da caixa e em cima do livro. Em cima de indica a posição sobre uma superfície.","De соединяется с артиклем: de + a = da, de + o = do. Говорим dentro da caixa и em cima do livro. Em cima de указывает положение на поверхности."],
    ["A pergunta de escolha verifica uma relação de posição. As legendas da imagem da casa verificam outro objetivo; um resultado não conclui todas as capacidades da unidade.","Вопрос с выбором проверяет одно пространственное отношение. Подписи схемы дома проверяют другую цель; один результат не означает освоения всех навыков раздела."],
  ],
} as const;
export const homeGlossary:Readonly<Record<string,string>>={
  espaços:"помещения",casa:"дом",divisão:"помещение",dormimos:"мы спим",existe:"существует; имеется",alguém:"кто-то",alguma:"какая-то",participante:"участник",móvel:"предмет мебели",móveis:"мебель",artigo:"артикль",plural:"множественное число",número:"число",posição:"положение",superfície:"поверхность",legendas:"подписи",resultado:"результат",separado:"отдельный",relação:"отношение",capacidades:"навыки",retoma:"повторяет",conjunto:"набор",aparelhos:"техника",aberta:"открыта",aberto:"открыт",curto:"короткий",perguntar:"спрашивать",reconhecer:"узнавать",nomear:"называть",adicional:"дополнительный",completa:"полная",
  quarto:"спальня",quartos:"спальни",sala:"комната / гостиная",salas:"комнаты / гостиные",cozinha:"кухня",cozinhas:"кухни","casa de banho":"ванная комната","casas de banho":"ванные комнаты",escritório:"домашний кабинет",escritórios:"домашние кабинеты",garagem:"гараж",garagens:"гаражи",mesa:"стол",mesas:"столы",caixa:"коробка",caixas:"коробки",porta:"дверь",portas:"двери",janela:"окно",janelas:"окна",gato:"кот",gatos:"коты",chave:"ключ",chaves:"ключи",livro:"книга",livros:"книги","onde está":"где находится","dentro de":"внутри","em cima de":"на поверхности","debaixo de":"под","ao lado de":"рядом с",
};
