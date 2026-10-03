import { pairVocabulary, studyVocabularyGroups } from "./vocabulary-catalog.ts";
import { vocabularySets } from "./vocabulary-model.ts";
import { firstVerticalSliceContentPack as pack } from "./manifest.ts";
import { verbs, allVerbKeys, type VerbKey, type Tense } from "../conjugation/data.ts";
import { verbCards } from "../cards/data/verb-cards.ts";
import { sceneImageActivities } from "./picture-scenes.ts";
import { clothingImageActivity } from "./clothing.ts";
import { houseImageActivity } from "./house.ts";
import { searchWords } from "../practice/word-search.ts";
import { generalVocabulary } from "./general-vocabulary.ts";
import { vocabularyLessons } from "./vocabulary-lessons.ts";
import type { GeneralVocabularyPartOfSpeech } from "./general-vocabulary-types.ts";
import type { LearningCatalog, LexicalEntry, LearningMeaning, LearningTopic, LearningCollection, GrammarTopic, VerbPattern, ActivityBinding, UsageModule } from "./learning-model.ts";

// Explicitly reviewed equivalents. Never merge meanings solely by translated text.
const equivalentLabels = new Set(["a árvore", "a relva", "o guarda-sol", "a toalha", "a cadeira", "a mesa", "o prato", "a colher", "a chávena", "a bicicleta", "o casaco", "a mochila", "o caderno", "o lápis", "a caneta", "o livro", "a borracha", "a régua"]);
const normalizeLemma = (value: string) => value.toLocaleLowerCase("pt-PT").normalize("NFD").replace(/\p{M}/gu, "").replace(/^(o|a|os|as) /, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const entryIdFor = (partOfSpeech: LexicalEntry["partOfSpeech"], lemma: string, fallback?: string) => `lexeme:${partOfSpeech}:${normalizeLemma(lemma) || fallback || "unknown"}`;
const generalPartOfSpeech = (value: GeneralVocabularyPartOfSpeech): LexicalEntry["partOfSpeech"] => value === "adverb-or-other" ? "unclassified" : value;
const ordered = [...pairVocabulary].sort((a,b)=>Number(a.id.startsWith("scene-word:"))-Number(b.id.startsWith("scene-word:")));
const owner = new Map<string,string>();
const meaningByLegacy = new Map<string,string>();
const entryMap = new Map<string,LexicalEntry>();
const meaningMap = new Map<string,LearningMeaning>();
for (const word of ordered) {
  const item=pack.studyItems.find(item=>item.id===word.id);
  const deck=verbCards.find(card=>card.id===word.id);
  const infinitive=deck?.pt ?? (item?.display.type==="verb"?item.display.infinitive:undefined);
  const key=infinitive&&allVerbKeys.find(key=>verbs[key].infinitive===infinitive);
  const noun=item?.display.type==="noun"?item.display:undefined;
  const lemma=infinitive??noun?.lemma??word.label.replace(/^(o|a|os|as) /,"");
  const partOfSpeech:LexicalEntry["partOfSpeech"]=infinitive?"verb":noun||/^(o|a|os|as) /.test(word.label)?"noun":"expression";
  const entryId=entryIdFor(partOfSpeech,lemma,word.id);
  const existing=equivalentLabels.has(word.label)?owner.get(word.label):undefined;
  const meaningId=existing??`meaning:${word.id}`;
  meaningByLegacy.set(word.id,meaningId);
  if(existing){const m=meaningMap.get(existing)!;m.legacyWordIds=[...m.legacyWordIds,word.id];continue;}
  owner.set(word.label,meaningId);
  const previousEntry=entryMap.get(entryId);
  entryMap.set(entryId, {id:entryId,lemma,partOfSpeech,...previousEntry,...(key?{conjugationKey:key}:{}),...(noun?{morphology:{article:noun.definiteArticle,plural:noun.plural,pluralArticle:noun.pluralDefiniteArticle,gender:noun.definiteArticle==="o"?"masculine" as const:"feminine" as const}}:{})});
  meaningMap.set(meaningId,{id:meaningId,entryId,translation:word.translation,legacyWordIds:[word.id],status:item?"source-backed":"needs-review",...(item?{canonicalTarget:item.target}:{})});
}
// Add supported trainer verbs without minting/changing card identities.
for(const key of allVerbKeys){const id=entryIdFor("verb",verbs[key].infinitive);if(!entryMap.has(id))entryMap.set(id,{id,lemma:verbs[key].infinitive,partOfSpeech:"verb",conjugationKey:key});}

const reviewedSourceIds = new Set(vocabularyLessons.flatMap(lesson=>lesson.items.map(item=>item.sourceEntryId)));
const lessonItemBySourceId = new Map(vocabularyLessons.flatMap(lesson=>lesson.items.map(item=>[item.sourceEntryId,item] as const)));
const meaningBySource = new Map<string,string>();
for(const source of generalVocabulary){
  const partOfSpeech=generalPartOfSpeech(source.partOfSpeech);
  const entryId=entryIdFor(partOfSpeech,source.portuguese,source.id);
  const lessonItem=lessonItemBySourceId.get(source.id);
  const article=lessonItem?.display.match(/^(o|a)\s/)?.[1] as "o"|"a"|undefined;
  const existingEntry=entryMap.get(entryId);
  entryMap.set(entryId,{
    id:entryId,
    lemma:source.portuguese,
    partOfSpeech,
    ...existingEntry,
    ...(partOfSpeech==="noun"&&article&&!existingEntry?.morphology?{morphology:{article,gender:article==="o"?"masculine":"feminine"}}:{}),
  });
  const meaningId=`meaning:${source.id}`;
  meaningBySource.set(source.id,meaningId);
  meaningMap.set(meaningId,{id:meaningId,entryId,translation:source.translation,legacyWordIds:[],sourceEntryIds:[source.id],status:reviewedSourceIds.has(source.id)?"source-backed":"needs-review"});
}
const grammar: GrammarTopic[] = [
  {id:"grammar:present",title:"Настоящее время",prerequisiteIds:[],destination:{status:"available",href:"/learning/conjugation"}},
  {id:"grammar:past",title:"Pretérito Perfeito",prerequisiteIds:[],destination:{status:"available",href:"/learning/past-suns"}},
  {id:"grammar:future-ir",title:"Будущее: ir + infinitivo",prerequisiteIds:["grammar:present"],destination:{status:"available",href:"/learning/future"}},
  ...(["present","past"] as const).flatMap(tense=>(["ar","er","ir","irregular"] as const).map(group=>({id:`grammar:${tense}:${group}`,title:`${tense=== "present"?"Настоящее":"Прошедшее"}: ${group}`,prerequisiteIds:[`grammar:${tense}`],destination:{status:"planned" as const}}))),
];
const verbPatterns: VerbPattern[]=allVerbKeys.flatMap(key=>(["present","past"] as Tense[]).map(tense=>{
  const verb=verbs[key],ending=verb.infinitive.slice(-2) as "ar"|"er"|"ir";
  const pattern=verb.group==="irregular"?"irregular":key==="crescer"&&tense==="present"||key==="ficar"&&tense==="past"?"spelling-change":key==="descobrir"&&tense==="present"?"stem-change":"regular";
  return {entryId:`lexeme:verb:${verb.infinitive}`,tense,infinitiveEnding:ending,pattern,grammarTopicId:`grammar:${tense}:${pattern==="irregular"?"irregular":ending}`};
}));
const topics:LearningTopic[]=studyVocabularyGroups.map(g=>({id:`topic:${g.id}`,title:g.title,parentIds:[]}));
type MutableLearningCollection = Omit<LearningCollection,"topicIds"|"meaningIds"> & {topicIds:string[];meaningIds:string[]};
const collections:MutableLearningCollection[]=studyVocabularyGroups.flatMap(g=>vocabularySets(g).map(s=>({id:`collection:${s.id}`,title:s.title,topicIds:[`topic:${g.id}`],meaningIds:[...new Set(s.words.map(id=>meaningByLegacy.get(id)!))],source:{kind:"vocabulary" as const,legacySetId:s.id,...(s.sourceHref?{href:s.sourceHref}:{})}})));
// A thematic collection can contain different parts of speech; these memberships share IDs.
const daily=["falar","dizer","saber","ter","ser","estar","ir","vir","fazer","trazer","comer","beber"];
collections.push({id:"collection:basic-verbs",title:"Самые нужные глаголы",topicIds:["topic:everyday"],meaningIds:[...meaningMap.values()].filter(m=>daily.includes(entryMap.get(m.entryId)!.lemma)&&entryMap.get(m.entryId)!.partOfSpeech==="verb").map(m=>m.id),source:{kind:"vocabulary",legacySetId:"curated-basic-verbs"}});
topics.push({id:"topic:everyday",title:"Повседневная жизнь",parentIds:[]});
// Semantic topics are independent of source folders and presentation formats.
const semanticTopics = [
  ["food", "Еда и покупки", ["market", "breakfast"]],
  ["nature", "Природа", ["garden", "park", "beach", "weather", "rain"]],
  ["animals", "Животные", ["farm", "garden", "park"]],
  ["city", "Город и дорога", ["street", "park"]],
  ["school", "Школа", ["school"]],
] as const;
for (const [id,title,sceneIds] of semanticTopics) {
  topics.push({id:`topic:${id}`,title,parentIds:[]});
  collections.forEach(collection=>{if(sceneIds.some(scene=>collection.source.legacySetId===`scene-set-${scene}`))collection.topicIds.push(`topic:${id}`);});
}
topics.push(
  {id:"topic:work",title:"Работа и встречи",parentIds:[]},
  {id:"topic:health",title:"Здоровье и самочувствие",parentIds:[]},
  {id:"topic:people",title:"Люди и состояния",parentIds:[]},
);
const everyday = collections.find(c=>c.id === "collection:basic-verbs")!;
collections.filter(c=>["scene-set-breakfast","scene-set-school"].includes(c.source.legacySetId??"")).forEach(c=>c.topicIds.push("topic:everyday"));
// Link food verbs into Food without cloning their meanings.
collections.push({id:"collection:food-actions",title:"Действия за столом",topicIds:["topic:food","topic:everyday"],meaningIds:everyday.meaningIds.filter(id=>["comer","beber"].includes(entryMap.get(meaningMap.get(id)!.entryId)!.lemma)),source:{kind:"vocabulary",legacySetId:"curated-food-actions"}});

const generalTopicIds = {
  verb: "topic:general-vocabulary:verbs",
  noun: "topic:general-vocabulary:nouns",
  adjective: "topic:general-vocabulary:adjectives",
  "adverb-or-other": "topic:general-vocabulary:other",
} as const;
topics.push(
  {id:"topic:general-vocabulary",title:"Вся подборка",parentIds:[]},
  {id:generalTopicIds.verb,title:"Глаголы",parentIds:["topic:general-vocabulary"]},
  {id:generalTopicIds.noun,title:"Существительные",parentIds:["topic:general-vocabulary"]},
  {id:generalTopicIds.adjective,title:"Прилагательные",parentIds:["topic:general-vocabulary"]},
  {id:generalTopicIds["adverb-or-other"],title:"Другие слова",parentIds:["topic:general-vocabulary"]},
  {id:"topic:short-vocabulary-lessons",title:"Короткие уроки",parentIds:[]},
);
collections.push({id:"collection:general-vocabulary:all",title:"Все 351 слово",topicIds:["topic:general-vocabulary"],meaningIds:generalVocabulary.map(source=>meaningBySource.get(source.id)!),source:{kind:"vocabulary"}});
for(const partOfSpeech of ["verb","noun","adjective","adverb-or-other"] as const){
  collections.push({id:`collection:general-vocabulary:${partOfSpeech}`,title:topics.find(topic=>topic.id===generalTopicIds[partOfSpeech])!.title,topicIds:[generalTopicIds[partOfSpeech]],meaningIds:generalVocabulary.filter(source=>source.partOfSpeech===partOfSpeech).map(source=>meaningBySource.get(source.id)!),source:{kind:"vocabulary"}});
}
const vocabularyLessonTopics: Record<string, string> = {
  "vocabulary-lesson:home": "topic:vocabulary-house",
  "vocabulary-lesson:work": "topic:work",
  "vocabulary-lesson:city": "topic:city",
  "vocabulary-lesson:cooking": "topic:food",
  "vocabulary-lesson:health": "topic:health",
  "vocabulary-lesson:people": "topic:people",
  "vocabulary-lesson:communication": "topic:vocabulary-verbs",
  "vocabulary-lesson:movement": "topic:vocabulary-verbs",
};
for(const lesson of vocabularyLessons){
  collections.push({id:`collection:${lesson.id}`,title:lesson.title,topicIds:["topic:short-vocabulary-lessons",vocabularyLessonTopics[lesson.id]],meaningIds:lesson.items.map(item=>meaningBySource.get(item.sourceEntryId)!),source:{kind:"lesson"}});
}
const meaningId = (legacyWordId: string) => {
  const id = meaningByLegacy.get(legacyWordId);
  if (!id) throw new Error(`Unknown usage-module word: ${legacyWordId}`);
  return id;
};
const schoolWord = (slug: string) => meaningId(`scene-word:${slug}`);
const usageModules: UsageModule[] = [{
  id: "usage:school-materials-in-context",
  title: "Школьные вещи во фразах",
  situation: "Посмотри, как знакомые слова меняются внутри обычных школьных фраз, а затем дополни похожие предложения.",
  collectionIds: ["collection:scene-set-school"],
  newMeaningIds: [],
  reviewedMeaningIds: ["a-mochila", "o-caderno", "o-lapis", "a-caneta", "o-livro", "a-borracha", "a-regua"].map(schoolWord),
  recognitionOnly: ["está", "tenho", "há", "escrevo", "ler", "abro", "medir", "uso", "apagar", "guardo", "materiais"],
  examples: [
    { id: "example:school-book-in-backpack", portuguese: "O livro está na mochila.", translation: "Книга находится в рюкзаке.", meaningIds: [schoolWord("o-livro"), schoolWord("a-mochila")], grammarTopicIds: ["grammar:present"] },
    { id: "example:school-have-pencil-notebook", portuguese: "Tenho um lápis e um caderno.", translation: "У меня есть карандаш и тетрадь.", meaningIds: [schoolWord("o-lapis"), schoolWord("o-caderno")], grammarTopicIds: ["grammar:present"] },
    { id: "example:school-pen-beside-ruler", portuguese: "Há uma caneta ao lado da régua.", translation: "Рядом с линейкой лежит ручка.", meaningIds: [schoolWord("a-caneta"), schoolWord("a-regua")], grammarTopicIds: ["grammar:present"] },
    { id: "example:school-write-with-pen", portuguese: "Escrevo no caderno com a caneta.", translation: "Я пишу в тетради ручкой.", meaningIds: [schoolWord("o-caderno"), schoolWord("a-caneta")], grammarTopicIds: ["grammar:present"] },
  ],
  exercises: [
    { id: "usage-cloze:school-read-book", prompt: "Что открывают, чтобы читать?", before: "Para ler, abro ", after: ".", correctOptionId: "school-read-book", feedback: "Para ler, abro o livro. — Чтобы читать, я открываю книгу.", options: [
      { id: "school-read-book", text: "o livro", meaningId: schoolWord("o-livro"), icon: "📖" },
      { id: "school-read-ruler", text: "a régua", meaningId: schoolWord("a-regua"), icon: "📏" },
      { id: "school-read-eraser", text: "a borracha", meaningId: schoolWord("a-borracha"), icon: "▱" },
    ] },
    { id: "usage-cloze:school-measure-ruler", prompt: "Чем измеряют длину?", before: "Para medir, uso ", after: ".", correctOptionId: "school-measure-ruler", feedback: "Para medir, uso a régua. — Чтобы измерить, я использую линейку.", options: [
      { id: "school-measure-ruler", text: "a régua", meaningId: schoolWord("a-regua"), icon: "📏" },
      { id: "school-measure-pen", text: "a caneta", meaningId: schoolWord("a-caneta"), icon: "🖊️" },
      { id: "school-measure-notebook", text: "o caderno", meaningId: schoolWord("o-caderno"), icon: "📓" },
    ] },
    { id: "usage-cloze:school-erase", prompt: "Чем стирают написанное карандашом?", before: "Para apagar, uso ", after: ".", correctOptionId: "school-erase-eraser", feedback: "Para apagar, uso a borracha. — Чтобы стереть, я использую ластик.", options: [
      { id: "school-erase-eraser", text: "a borracha", meaningId: schoolWord("a-borracha"), icon: "▱" },
      { id: "school-erase-pencil", text: "o lápis", meaningId: schoolWord("o-lapis"), icon: "✏️" },
      { id: "school-erase-book", text: "o livro", meaningId: schoolWord("o-livro"), icon: "📖" },
    ] },
    { id: "usage-cloze:school-store", prompt: "Куда складывают школьные принадлежности?", before: "Guardo os materiais ", after: ".", correctOptionId: "school-store-backpack", feedback: "Guardo os materiais na mochila. — Я храню школьные принадлежности в рюкзаке.", options: [
      { id: "school-store-backpack", text: "na mochila", meaningId: schoolWord("a-mochila"), icon: "🎒" },
      { id: "school-store-notebook", text: "no caderno", meaningId: schoolWord("o-caderno"), icon: "📓" },
      { id: "school-store-ruler", text: "na régua", meaningId: schoolWord("a-regua"), icon: "📏" },
    ] },
    { id: "usage-cloze:school-write", prompt: "Дополни фразу про работу в тетради.", before: "Escrevo ", after: " com a caneta.", correctOptionId: "school-write-notebook", feedback: "Escrevo no caderno com a caneta. — Я пишу в тетради ручкой.", options: [
      { id: "school-write-notebook", text: "no caderno", meaningId: schoolWord("o-caderno"), icon: "📓" },
      { id: "school-write-backpack", text: "na mochila", meaningId: schoolWord("a-mochila"), icon: "🎒" },
      { id: "school-write-ruler", text: "na régua", meaningId: schoolWord("a-regua"), icon: "📏" },
    ] },
  ],
  relatedLinks: [
    { id: "usage-link:school-location", label: "Где находится предмет?", href: "/learning/lessons/lesson%3Aa1-1%3Alocate-object", kind: "lesson" },
    { id: "usage-link:school-possession", label: "У меня есть / здесь есть", href: "/learning/lessons/lesson%3Aa1-1%3Apossession-and-presence", kind: "lesson" },
    { id: "usage-link:school-present", label: "Формы настоящего времени", href: "/learning/conjugation", kind: "grammar" },
  ],
}];
const scenes=[houseImageActivity,clothingImageActivity,...sceneImageActivities].map(image=>({id:image.id,title:image.title,image:{src:image.image.src,width:image.image.width,height:image.image.height},targets:image.spots.map(spot=>({id:spot.id,meaningIds:spot.acceptedWordIds.map(id=>meaningByLegacy.get(id)!),anchor:{x:spot.x/image.image.width,y:spot.y/image.image.height}}))}));
const activities:ActivityBinding[]=collections.filter(c=>c.source.legacySetId).flatMap(c=>{
  const sourceIds=new Set(c.meaningIds.flatMap(id=>meaningMap.get(id)!.legacyWordIds));
  const searchable=searchWords(pairVocabulary.filter(word=>sourceIds.has(word.id))).length>0;
  const mechanics=(searchable?["cards","pairs","word-search"]:["cards","pairs"]) as ("cards"|"pairs"|"word-search")[];
  return mechanics.map(mechanic=>({id:`activity:${c.id}:${mechanic}`,target:{kind:"vocabulary" as const,collectionId:c.id,mechanic}}));
});
scenes.forEach(s=>activities.push({id:`activity:${s.id}`,target:{kind:"image",sceneId:s.id,targetIds:s.targets.map(t=>t.id)}}));
for(const tense of ["present","past"] as const)activities.push({id:`activity:basic-suns:${tense}`,target:{kind:"conjugation",tense,mechanic:"sun",entryIds:allVerbKeys.filter(k=>daily.includes(k)).map(k=>`lexeme:verb:${k}`)}});
usageModules.forEach(module=>activities.push({id:`activity:${module.id}`,target:{kind:"usage",usageModuleId:module.id,mechanic:"examples-and-cloze"}}));
export const learningCatalog: LearningCatalog={schemaVersion:1,entries:[...entryMap.values()],meanings:[...meaningMap.values()],topics,collections,grammar,verbPatterns,scenes,categories:[],usageModules,activities};
export function meaningForLegacyWord(id:string){const meaningId=meaningByLegacy.get(id);return learningCatalog.meanings.find(m=>m.id===meaningId);}
export function meaningForSourceEntry(id:string){const meaningId=meaningBySource.get(id);return learningCatalog.meanings.find(m=>m.id===meaningId);}
export function ruleForVerb(verb:VerbKey,tense:Tense){const pattern=verbPatterns.find(p=>p.entryId===`lexeme:verb:${verb}`&&p.tense===tense)!;return {pattern,topic:grammar.find(g=>g.id===pattern.grammarTopicId)!};}
