import { generalVocabulary } from "./general-vocabulary.ts";
import type { VocabularyGroup, VocabularyWord } from "./vocabulary-model.ts";
import { foodPhotoNouns } from "./food-photo-vocabulary.ts";
import { foodIllustration } from "./food-illustrations.ts";

export type NounSeed = readonly [key: string, article: "o" | "a", lemma: string, plural: string, translation: string, pt: string, ru: string];
// Original examples; textbooks inform the situations, never supply published text or art.
export const topicNounSeeds: readonly NounSeed[] = [
  ...foodPhotoNouns,
  ["mae","a","mãe","mães","Мама","A minha mãe está em casa.","Моя мама дома."],
  ["pai","o","pai","pais","Папа","O meu pai está na cozinha.","Мой папа на кухне."],
  ["irmao","o","irmão","irmãos","Брат","O meu irmão lê um livro.","Мой брат читает книгу."],
  ["irma","a","irmã","irmãs","Сестра","A minha irmã está na escola.","Моя сестра в школе."],
  ["avo-f","a","avó","avós","Бабушка","A minha avó gosta de chá.","Моя бабушка любит чай."],
  ["avo-m","o","avô","avôs","Дедушка","O meu avô está no jardim.","Мой дедушка в саду."],
  ["tio","o","tio","tios","Дядя","O meu tio mora em Lisboa.","Мой дядя живёт в Лиссабоне."],
  ["tia","a","tia","tias","Тётя","A minha tia tem uma bicicleta.","У моей тёти есть велосипед."],
  ["primo","o","primo","primos","Двоюродный брат","O meu primo joga no parque.","Мой двоюродный брат играет в парке."],
  ["prima","a","prima","primas","Двоюродная сестра","A minha prima gosta de ler.","Моя двоюродная сестра любит читать."],
  ["filho","o","filho","filhos","Сын","O filho da Ana chama-se Rui.","Сына Аны зовут Руй."],
  ["filha","a","filha","filhas","Дочь","A filha do Rui chama-se Inês.","Дочь Руя зовут Инеш."],
  ["maca","a","maçã","maçãs","Яблоко","Como uma maçã ao lanche.","Я ем яблоко на полдник."],
  ["banana","a","banana","bananas","Банан","A banana está na mesa.","Банан лежит на столе."],
  ["laranja","a","laranja","laranjas","Апельсин","Quero uma laranja.","Я хочу апельсин."],
  ["pera","a","pera","peras","Груша","Esta pera é doce.","Эта груша сладкая."],
  ["morango","o","morango","morangos","Клубника","Gosto de morangos.","Я люблю клубнику."],
  ["melancia","a","melancia","melancias","Арбуз","A melancia está no frigorífico.","Арбуз в холодильнике."],
  ["pao","o","pão","pães","Хлеб","Como pão ao pequeno-almoço.","Я ем хлеб на завтрак."],
  ["leite","o","leite","leites","Молоко","Bebo leite ao pequeno-almoço.","Я пью молоко на завтрак."],
  ["agua","a","água","águas","Вода","Quero um copo de água.","Я хочу стакан воды."],
  ["queijo","o","queijo","queijos","Сыр","Ponho queijo no pão.","Я кладу сыр на хлеб."],
  ["arroz","o","arroz","arrozes","Рис","O arroz está no prato.","Рис на тарелке."],
  ["peixe","o","peixe","peixes","Рыба","Hoje como peixe com arroz.","Сегодня я ем рыбу с рисом."],
  ["carne","a","carne","carnes","Мясо","A carne está no forno.","Мясо в духовке."],
  ["frango","o","frango","frangos","Курица (мясо)","Ao almoço, como frango.","На обед я ем курицу."],
  ["prato","o","prato","pratos","Тарелка","O prato está na mesa.","Тарелка на столе."],
  ["colher","a","colher","colheres","Ложка","Como a sopa com uma colher.","Я ем суп ложкой."],
  ["garfo","o","garfo","garfos","Вилка","Uso um garfo para comer.","Я пользуюсь вилкой, чтобы есть."],
  ["faca","a","faca","facas","Нож","A faca está ao lado do prato.","Нож лежит рядом с тарелкой."],
  ["copo","o","copo","copos","Стакан","O copo tem água.","В стакане вода."],
  ["guardanapo","o","guardanapo","guardanapos","Салфетка","O guardanapo está na mesa.","Салфетка на столе."],
  ["cenoura","a","cenoura","cenouras","Морковь","Corto uma cenoura para a sopa.","Я режу морковь для супа."],
  ["cebola","a","cebola","cebolas","Лук","Ponho uma cebola na sopa.","Я кладу луковицу в суп."],
  ["pepino","o","pepino","pepinos","Огурец","O pepino está na salada.","Огурец в салате."],
  ["pimento","o","pimento","pimentos","Сладкий перец","Corto um pimento vermelho.","Я режу красный сладкий перец."],
  ["iogurte","o","iogurte","iogurtes","Йогурт","Como um iogurte ao lanche.","Я ем йогурт на полдник."],
  ["manteiga","a","manteiga","manteigas","Сливочное масло","Ponho manteiga no pão.","Я намазываю сливочное масло на хлеб."],
  ["massa","a","massa","massas","Макароны","Hoje como massa com queijo.","Сегодня я ем макароны с сыром."],
  ["aveia","a","aveia","aveias","Овёс, овсянка","Como flocos de aveia ao pequeno-almoço.","Я ем овсяные хлопья на завтрак."],
  ["cabeca","a","cabeça","cabeças","Голова","Ponho um chapéu na cabeça.","Я надеваю шляпу на голову."],
  ["olho","o","olho","olhos","Глаз","Vejo com os olhos.","Я вижу глазами."],
  ["orelha","a","orelha","orelhas","Ухо (ушная раковина)","Tenho duas orelhas.","У меня два уха."],
  ["ouvido","o","ouvido","ouvidos","Ухо (орган слуха)","Ouço com os ouvidos.","Я слышу ушами."],
  ["nariz","o","nariz","narizes","Нос","Cheiro a flor com o nariz.","Я нюхаю цветок носом."],
  ["boca","a","boca","bocas","Рот","Abro a boca para falar.","Я открываю рот, чтобы говорить."],
  ["lingua","a","língua","línguas","Язык (часть тела)","Sinto os sabores com a língua.","Я ощущаю вкусы языком."],
  ["mao","a","mão","mãos","Рука (кисть)","Lavo as mãos antes de comer.","Я мою руки перед едой."],
  ["braco","o","braço","braços","Рука (от плеча до кисти)","Levanto o braço.","Я поднимаю руку."],
  ["perna","a","perna","pernas","Нога","Tenho duas pernas.","У меня две ноги."],
  ["pe","o","pé","pés","Ступня","O sapato está no pé.","Туфля на ноге."],
  ["dedo","o","dedo","dedos","Палец","Cada mão tem cinco dedos.","На каждой руке пять пальцев."],
  ["joelho","o","joelho","joelhos","Колено","Dobro o joelho.","Я сгибаю колено."],
  ["barriga","a","barriga","barrigas","Живот","Ponho a mão na barriga.","Я кладу руку на живот."],
];

export const topicSetDefinitions = [
  { id:"expansion-family-close", title:"Моя семья", group:"family", keys:["mae","pai","irmao","irma","avo-f","avo-m"] },
  { id:"expansion-family-relatives", title:"Родственники", group:"family", keys:["tio","tia","primo","prima","filho","filha"] },
  { id:"expansion-food-fruit", title:"Фрукты и ягоды", group:"food", keys:["maca","banana","laranja","pera","morango","melancia"] },
  { id:"expansion-food-meals", title:"Что едим и пьём", group:"food", keys:["pao","leite","agua","queijo","arroz","peixe","carne","frango"] },
  { id:"expansion-food-table", title:"Накрываем на стол", group:"food", keys:["prato","colher","garfo","faca","copo","guardanapo"] },
  { id:"expansion-food-vegetables", title:"Овощи", group:"food", keys:["cenoura","cebola","pepino","pimento"] },
  { id:"expansion-food-dairy", title:"Молочные продукты", group:"food", keys:["leite","queijo","iogurte","manteiga"] },
  { id:"expansion-food-grains", title:"Зерновые продукты", group:"food", keys:["pao","arroz","massa","aveia"] },
  { id:"expansion-food-fruit-more", title:"Ещё фрукты и ягоды", group:"food", keys:["quivi","roma","manga","tangerina","diospiro","uvas","framboesas"] },
  { id:"expansion-food-vegetables-more", title:"Ещё овощи и зелень", group:"food", keys:["couve","curgete","tomate","salsa"] },
  { id:"expansion-food-meat", title:"Мясо и мясные продукты", group:"food", keys:["fiambre","presunto","bife","hamburguer","salsicha","frango"] },
  { id:"expansion-food-seafood", title:"Рыба и морепродукты", group:"food", keys:["camarao","sardinha","salmao","bacalhau"] },
  { id:"expansion-food-seasoning", title:"Масла и приправы", group:"food", keys:["oleo","azeite","sal","vinagre","pimenta"] },
  { id:"expansion-food-sauces", title:"Соусы", group:"food", keys:["ketchup","maionese","mostarda"] },
  { id:"expansion-food-other", title:"Десерты, яйца и бобовые", group:"food", keys:["gelado","bolo","ovos","feijao"] },
  { id:"expansion-body-face", title:"Лицо и руки", group:"body", keys:["cabeca","olho","orelha","ouvido","nariz","boca","lingua","mao"] },
  { id:"expansion-body-movement", title:"Тело и движение", group:"body", keys:["braco","perna","pe","dedo","joelho","barriga"] },
] as const;

export function buildTopicExpansion(existing: readonly VocabularyWord[]) {
  const byKey = new Map<string, VocabularyWord>();
  const newWords: VocabularyWord[] = [];
  for (const [key,article,lemma,plural,translation,pt,ru] of topicNounSeeds) {
    // Accent-sensitive: avó and avô are different words. Reuse exact existing identities.
    const found = existing.find(word => word.noun?.lemma === lemma || word.label === `${article} ${lemma}`);
    const source = generalVocabulary.find(word => word.partOfSpeech === "noun" && word.portuguese === lemma);
    const illustration = foodIllustration(key);
    const word: VocabularyWord = { ...found, id: found?.id ?? source?.id ?? `vocabulary:noun:${key}`, label: found?.label ?? `${article} ${lemma}`, translation: found?.translation ?? source?.translation ?? translation, noun:{lemma,article,plural,pluralArticle:article === "a" ? "as" : "os"}, example:{pt,ru}, ...(illustration ? {illustration} : {}) };
    byKey.set(key,word);
    if (!found) newWords.push(word);
  }
  const groups: VocabularyGroup[] = ([ ["family","Семья и друзья"], ["food","Еда: новые наборы"], ["body","Тело"] ] as const).map(([id,title]) => ({
    id:`vocabulary-${id === "food" ? "food-more" : id}`,title,
    subgroups:topicSetDefinitions.filter(set=>set.group===id).map(set=>{
      const category = foodCategories.find(category=>category.setIds.includes(set.id));
      const distractors = foodCategories.filter(other=>other.id!==category?.id).flatMap(other=>topicSetDefinitions.filter(item=>other.setIds.includes(item.id)).flatMap(item=>item.keys.map(key=>byKey.get(key)!.id)));
      return {id:set.id,title:set.title,sets:[{id:set.id,title:set.title,words:set.keys.map(key=>byKey.get(key)!.id), ...(category ? {oddOneOut:{answerWordId:category.id,distractors}} : {})}]};
    }),
  }));
  return { byKey, newWords, groups, decorate: (word: VocabularyWord) => [...byKey.values()].find(item=>item.id===word.id) ?? word };
}

// Authored culinary categories: do not infer membership from random words.
export const foodCategories: readonly (VocabularyWord & {setIds: readonly string[]})[] = [
  {id:"vocabulary:category:fruit",setIds:["expansion-food-fruit","expansion-food-fruit-more"],label:"a fruta",translation:"Фрукты и ягоды",acceptedAnswers:{pt:["frutas","as frutas"],ru:["фрукты","ягоды"]}},
  {id:"vocabulary:category:vegetables",setIds:["expansion-food-vegetables","expansion-food-vegetables-more"],label:"os legumes",translation:"Овощи и зелень",acceptedAnswers:{pt:["legumes","os vegetais","vegetais","as hortaliças","hortaliças"],ru:["овощи","овощи и зелень"]}},
  {id:"vocabulary:category:dairy",setIds:["expansion-food-dairy"],label:"os laticínios",translation:"Молочные продукты",acceptedAnswers:{pt:["laticínios","os lacticínios","lacticínios","produtos lácteos"],ru:["молочные продукты"]}},
  {id:"vocabulary:category:grains",setIds:["expansion-food-grains"],label:"os cereais",translation:"Зерновые продукты",acceptedAnswers:{pt:["cereais","produtos de cereais"],ru:["зерновые","зерновые продукты","злаки"]}},
  {id:"vocabulary:category:seafood",setIds:["expansion-food-seafood"],label:"o peixe e o marisco",translation:"Рыба и морепродукты",acceptedAnswers:{pt:["peixe e marisco","peixe e frutos do mar","peixe e moluscos"],ru:["рыба и морепродукты","морепродукты"]}},
];
