import type {VocabularyWord} from "./vocabulary-model";
import {foodCategories,topicNounSeeds,topicSetDefinitions} from "./topic-expansion";

// Culinary groups reuse the authored food taxonomy, not botanical classifications.
export const foodSortingCategories=[
  ...foodCategories,
  {id:"vocabulary:category:meat",label:"a carne",translation:"Мясо и мясные продукты",setIds:["expansion-food-meat"]},
];
const membership=new Map<string,string>();
for(const category of foodSortingCategories){
  const keys=new Set<string>(topicSetDefinitions.filter(set=>category.setIds.includes(set.id)).flatMap(set=>[...set.keys]));
  if(category.id==="vocabulary:category:seafood")keys.add("peixe");
  if(category.id==="vocabulary:category:meat")keys.add("carne");
  for(const [key,,lemma] of topicNounSeeds)if(keys.has(key))membership.set(lemma,category.id);
}
// Existing quick-word enrichments have no expansion-set key. Add membership only,
// retaining their original word objects, IDs, translations and illustrations.
for(const lemma of ["limão","ananás","pêssego","ameixa"])membership.set(lemma,"vocabulary:category:fruit");
membership.set("batata","vocabulary:category:vegetables");
export function foodSortingCategory(word:VocabularyWord){
  const lemma=word.noun?.lemma??word.label.replace(/^(o|a|os|as) /,"");
  return foodSortingCategories.find(category=>category.id===membership.get(lemma));
}
export const foodSortingWords=(words:readonly VocabularyWord[])=>words.filter(word=>!!foodSortingCategory(word));
// Do not offer food sorting in a farm/verb/general dictionary because of one overlap.
export const canSortFood=(words:readonly VocabularyWord[])=>foodSortingWords(words).length>=Math.max(2,words.length/2);
export function foodSortingOptions(word:VocabularyWord,index:number){
  const target=foodSortingCategory(word);
  if(!target)return [];
  const others=foodSortingCategories.filter(category=>category.id!==target.id);
  const options=[target,others[index%others.length],others[(index+1)%others.length]];
  const offset=(index+1)%options.length;
  return [...options.slice(offset),...options.slice(0,offset)];
}
