import {catalogWords} from "./learning-catalog-view";
import type {VocabularyWord} from "./vocabulary-model";
import {verbCards} from "../cards/data/verb-cards";
const key=(text:string)=>text.toLocaleLowerCase("pt-PT").replace(/[.!?]/g,"").trim();
const shared=new Map(catalogWords.map(word=>[key(word.label),word]));
for(const card of verbCards)if(!shared.has(key(card.pt)))shared.set(key(card.pt),{id:card.id,label:card.pt,translation:card.ru});
const additions:Record<string,readonly (readonly [string,string])[]>={
  "basic-irregular":[["saber","Знать / уметь"],["dizer","Говорить / сказать"],["dar","Давать"],["ver","Видеть"],["ler","Читать"],["ouvir","Слышать / слушать"],["pôr","Класть / ставить"],["trazer","Приносить"],["sair","Выходить"],["pedir","Просить"],["dormir","Спать"],["sentir","Чувствовать"]],
  hello:[["Olá, tudo bem?","Привет, как дела?"],["Até já!","До скорой встречи (совсем скоро)!"],["Até logo!","До встречи сегодня!"],["Boa semana!","Хорошей недели!"],["Boas férias!","Хороших каникул / отпуска!"],["Boas festas!","С праздниками!"]],
  requests:[["Posso fazer uma pergunta?","Можно задать вопрос?"],["Pode ajudar-me?","Можете мне помочь?"],["Em que página estamos?","На какой мы странице?"],["Como se escreve?","Как это пишется?"],["O que significa?","Что это значит?"],["Não consigo ouvir.","Мне не слышно."]],
  instructions:[["Abre o livro.","Открой книгу."],["Fecha o caderno.","Закрой тетрадь."],["Levanta a mão.","Подними руку."],["Faz uma fila.","Встань в очередь."],["Senta-te.","Садись."],["Arruma o material.","Убери принадлежности."]],
  fruit:[["a laranja","Апельсин"],["a tangerina","Мандарин"],["o limão","Лимон"],["a manga","Манго"],["o ananás","Ананас"],["a melancia","Арбуз"],["o pêssego","Персик"],["a ameixa","Слива"]],
  food:[["a água","Вода"],["o leite","Молоко"],["o pão","Хлеб"],["o queijo","Сыр"],["o ovo","Яйцо"],["o arroz","Рис"],["a massa","Макароны"],["a sopa","Суп"],["o peixe","Рыба"],["o frango","Курица"],["a batata","Картофель"],["a cenoura","Морковь"],["o tomate","Помидор"],["o iogurte","Йогурт"]],
  "farm-animals":[["o burro","Осёл"],["o pato","Утка"],["o peru","Индюк"],["o galo","Петух"],["o coelho","Кролик"],["o cordeiro","Ягнёнок"]],
  "clothes-basic":[["o casaco","Куртка / пальто"],["a camisola","Свитер"],["a camisa","Рубашка"],["a saia","Юбка"],["o vestido","Платье"],["as meias","Носки"],["os sapatos","Туфли"],["as botas","Сапоги"],["o pijama","Пижама"],["o cachecol","Шарф"],["as luvas","Перчатки"],["o fato de banho","Купальник / плавки"]],
  backpack:[["a tesoura","Ножницы"],["a cola","Клей"],["o estojo","Пенал"],["o afia","Точилка"],["os lápis de cor","Цветные карандаши"],["a folha","Лист бумаги"],["a pasta","Папка"],["o marcador","Фломастер / маркер"]],
  polite:[["Desculpe.","Извините (вежливо)."],["Não faz mal.","Ничего страшного."],["Se faz favor.","Пожалуйста (при просьбе)."],["Muito obrigado.","Большое спасибо (говорит мужчина или мальчик)."],["Muito obrigada.","Большое спасибо (говорит женщина или девочка)."],["Está tudo bem.","Всё в порядке."]],
  "adult-everyday":[["Não sei.","Я не знаю."],["Não falo bem português.","Я пока плохо говорю по-португальски."],["Pode escrever, por favor?","Можете написать, пожалуйста?"],["Onde fica a casa de banho?","Где находится туалет?"],["Preciso de um saco.","Мне нужен пакет."],["Já volto.","Я скоро вернусь."]],
  "adult-small-talk":[["Como te chamas?","Как тебя зовут?"],["De onde és?","Откуда ты?"],["Moro aqui perto.","Я живу здесь рядом."],["O que fazes?","Чем ты занимаешься?"],["Que bom!","Как здорово!"],["Até à próxima!","До следующей встречи!"]],
  "adult-shopping":[["Tem pão?","У вас есть хлеб?"],["Queria este, por favor.","Мне вот этот, пожалуйста."],["Pode trazer o menu?","Можете принести меню?"],["Sem açúcar, por favor.","Без сахара, пожалуйста."],["Para levar, por favor.","С собой, пожалуйста."],["Posso experimentar?","Можно примерить?"],["Tem outro tamanho?","Есть другой размер?"],["Preciso do recibo.","Мне нужен чек."]],
  "adult-plans":[["Tens tempo hoje?","У тебя есть время сегодня?"],["Pode ser às cinco?","Можно в пять?"],["Até logo!","До встречи сегодня!"],["Vou de autocarro.","Я поеду на автобусе."],["Já cheguei.","Я уже на месте."],["Encontramo-nos à entrada.","Встретимся у входа."]],
  "child-actions":[["Estou a desenhar.","Я рисую."],["Estou a comer.","Я ем."],["Estou a estudar.","Я учусь."],["Vou ao recreio.","Я иду на перемену."],["Arrumo a mochila.","Я собираю рюкзак."],["Lavo as mãos.","Я мою руки."]],
  "child-classroom":[["Pode explicar outra vez?","Можете объяснить ещё раз?"],["Não consigo ver.","Мне не видно."],["Em que página estamos?","На какой мы странице?"],["Esqueci-me do caderno.","Я забыл / забыла тетрадь."],["Como se escreve?","Как это пишется?"],["O que significa?","Что это значит?"]],
  "child-permission":[["Posso ir ao quadro?","Можно выйти к доске?"],["Posso abrir a janela?","Можно открыть окно?"],["Posso fechar a porta?","Можно закрыть дверь?"],["Posso fazer uma pergunta?","Можно задать вопрос?"],["Posso trabalhar contigo?","Можно работать с тобой?"],["Posso ir buscar o livro?","Можно сходить за книгой?"]],
  "child-friends":[["Queres vir comigo?","Хочешь пойти со мной?"],["Senta-te aqui!","Садись здесь!"],["Queres ser meu amigo?","Хочешь быть моим другом?"],["Queres ser minha amiga?","Хочешь быть моей подругой?"],["Vamos partilhar!","Давай поделимся!"],["Até amanhã!","До завтра!"]],
  "child-games":[["Vamos jogar à bola!","Давай поиграем в мяч!"],["Quem começa?","Кто начинает?"],["Agora és tu!","Теперь ты!"],["Espera pela tua vez.","Дождись своей очереди."],["Quais são as regras?","Какие правила?"],["Vamos tentar outra vez!","Давай попробуем ещё раз!"]],
};
export function enrichWords(id:string,words:readonly VocabularyWord[]):readonly VocabularyWord[]{
  for(const word of words)if(!shared.has(key(word.label)))shared.set(key(word.label),word);
  const extra=(additions[id]??[]).map(([label,translation])=>{
    const normalized=key(label);const existing=shared.get(normalized);if(existing)return existing;
    const word={id:`vocabulary:essential:${normalized.normalize("NFD").replace(/\p{M}/gu,"").replace(/[^a-z]+/g,"-")}`,label,translation};shared.set(normalized,word);return word;
  });
  const unique=new Map<string,VocabularyWord>();
  for(const word of [...words,...extra])if(!unique.has(key(word.label)))unique.set(key(word.label),word);
  return [...unique.values()];
}
