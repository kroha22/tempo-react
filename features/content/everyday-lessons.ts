import { topicExpansion } from "./vocabulary-catalog.ts";

export type EverydayLessonId = "likes" | "body";
export const topicWord = (key: string) => {
  const word = topicExpansion.byKey.get(key);
  if (!word) throw new Error(`Missing topic word: ${key}`);
  return word;
};
export const preferenceFoods = [
  { key:"maca", phrase:"maçãs", ru:"яблоки", symbol:"🍎" },
  { key:"morango", phrase:"morangos", ru:"клубнику", symbol:"🍓" },
  { key:"pera", phrase:"peras", ru:"груши", symbol:"🍐" },
  { key:"queijo", phrase:"queijo", ru:"сыр", symbol:"🧀" },
  { key:"leite", phrase:"leite", ru:"молоко", symbol:"🥛" },
  { key:"arroz", phrase:"arroz", ru:"рис", symbol:"🍚" },
].map(food=>({...food,wordId:topicWord(food.key).id}));
export const preferencePeople = [
  {id:"eu",label:"Я",pt:"Eu",verb:"gosto",ru:"Я",positive:"люблю",negative:"не люблю"},
  {id:"tu",label:"Ты",pt:"Tu",verb:"gostas",ru:"Ты",positive:"любишь",negative:"не любишь"},
  {id:"ines",label:"Инеш",pt:"A Inês",verb:"gosta",ru:"Инеш",positive:"любит",negative:"не любит"},
] as const;
export function preferenceSentence(personIndex: number, foodIndex: number, negative: boolean) {
  const person=preferencePeople[personIndex],food=preferenceFoods[foodIndex];
  return {pt:`${person.pt} ${negative?"não ":""}${person.verb} de ${food.phrase}.`,ru:`${person.ru} ${negative?person.negative:person.positive} ${food.ru}.`};
}
export const bodyFunctions = [
  {key:"olho",part:"os olhos",action:"ver",question:"Чем мы видим?",pt:"Vejo com os olhos.",ru:"Я вижу глазами.",icon:"eye"},
  {key:"ouvido",part:"os ouvidos",action:"ouvir",question:"Чем мы слышим?",pt:"Ouço com os ouvidos.",ru:"Я слышу ушами.",icon:"ear"},
  {key:"nariz",part:"o nariz",action:"cheirar",question:"Чем мы чувствуем запахи?",pt:"Cheiro a flor com o nariz.",ru:"Я нюхаю цветок носом.",icon:"nose"},
  {key:"lingua",part:"a língua",action:"saborear",question:"Чем мы ощущаем вкус?",pt:"Sinto os sabores com a língua.",ru:"Я ощущаю вкусы языком.",icon:"tongue"},
  {key:"mao",part:"as mãos",action:"tocar",question:"Чем мы трогаем предметы?",pt:"Toco na mesa com as mãos.",ru:"Я касаюсь стола руками.",icon:"hand"},
  {key:"boca",part:"a boca",action:"falar",question:"Что мы открываем, чтобы говорить?",pt:"Abro a boca para falar.",ru:"Я открываю рот, чтобы говорить.",icon:"mouth"},
].map(item=>({...item,wordId:topicWord(item.key).id}));

type LessonCheck = {id:string;prompt:string;before:string;after:string;options:readonly string[];answer:string;explanation:string};
function bodyOptions(index:number) {
  const options=[bodyFunctions[index].part,bodyFunctions[(index+2)%bodyFunctions.length].part,bodyFunctions[(index+4)%bodyFunctions.length].part];
  return [...options.slice(index%3),...options.slice(0,index%3)];
}
export const everydayLessons: Record<EverydayLessonId,{title:string;canDo:string;rule:string;reviewedKeys:readonly string[];recognitionOnly:readonly string[];checks:readonly LessonCheck[]}> = {
  likes:{title:"Мне нравится · GOSTAR DE",canDo:"Я могу сказать, что люблю и не люблю есть.",rule:"После GOSTAR нужен предлог DE. Когда говорим о еде вообще: gosto de queijo, gosto de maçãs. НЕ ставим перед продуктом артикль. Для отрицания добавляем NÃO перед глаголом. О конкретном продукте: gosto do queijo desta loja — мне нравится сыр из этого магазина (de + o = do).",reviewedKeys:preferenceFoods.map(food=>food.key),recognitionOnly:["gosto","gostas","gosta","não","de","do"],checks:[
    {id:"likes-de",prompt:"Я люблю яблоки вообще. Какого слова не хватает?",before:"Gosto ",after:" maçãs.",options:["de","do","da"],answer:"de",explanation:"GOSTAR + DE: Gosto de maçãs. — Я люблю яблоки."},
    {id:"likes-negative",prompt:"Скажи: «Я не люблю молоко».",before:"Eu ",after:" de leite.",options:["não gosto","gosto não","não gosta"],answer:"não gosto",explanation:"NÃO ставится перед глаголом: Eu não gosto de leite."},
    {id:"likes-tu",prompt:"Ты любишь груши.",before:"Tu ",after:" de peras.",options:["gosta","gostas","gosto"],answer:"gostas",explanation:"С TU: gostas. Tu gostas de peras. — Ты любишь груши."},
    {id:"likes-ines",prompt:"Инеш любит рис.",before:"A Inês ",after:" de arroz.",options:["gostam","gosto","gosta"],answer:"gosta",explanation:"Она: gosta. A Inês gosta de arroz. — Инеш любит рис."},
    {id:"likes-cheese",prompt:"Выбери целую фразу: «Я не люблю сыр».",before:"",after:"",options:["Não gosto queijo.","Não gosto de queijo.","Gosto de queijo."],answer:"Não gosto de queijo.",explanation:"Не теряем DE и ставим NÃO перед GOSTO: Não gosto de queijo."},
  ]},
  body:{title:"Тело и действия",canDo:"Я могу назвать части тела и связать их с простыми действиями.",rule:"COM означает «с помощью»: vejo com os olhos — вижу глазами. O ouvido — ухо как орган слуха; a orelha — наружная часть уха. Действия здесь узнаём в готовых фразах; учить все их спряжения сейчас не нужно.",reviewedKeys:bodyFunctions.map(item=>item.key),recognitionOnly:["vejo","ouço","cheiro","sinto","toco","abro","com","para"],checks:bodyFunctions.map((item,index)=>({id:`body-${item.key}`,prompt:item.question,before:"",after:"",options:bodyOptions(index),answer:item.part,explanation:`${item.pt} — ${item.ru}`}))},
};
