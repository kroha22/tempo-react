import {useState,type ReactNode} from "react";
import {render,screen,fireEvent} from "@testing-library/react";
import {expect,it,vi} from "vitest";
import {foodSortingCategory,foodSortingOptions,foodSortingWords,canSortFood} from "@/features/content/food-sorting";
import {wordLibraryFor} from "@/features/content/word-learning-library";
import {wordBrowseSets} from "@/features/content/word-browse-sets";
import {FoodSorting} from "@/features/practice/FoodSorting";
import {QuickWords} from "@/features/practice/QuickWords";
import {ProfileLearningContext,emptyProfileLearning,type ProfileLearning} from "@/features/practice/profile-learning";
import {wordSessionSchema} from "@/features/practice/word-learning-session";
const words=[{id:"apple",label:"a maçã",translation:"Яблоко"},{id:"milk",label:"o leite",translation:"Молоко"},{id:"fish",label:"o peixe",translation:"Рыба"},{id:"water",label:"a água",translation:"Вода"}];
it("reuses exact source objects and culinary categories; skips mixed dishes and unrelated words",()=>{
  expect(foodSortingWords(words)).toEqual(words.slice(0,3));expect(foodSortingWords(words)[0]).toBe(words[0]);
  for(const [label,id] of [["o tomate","vegetables"],["a manteiga","dairy"],["o pão","grains"],["a carne","meat"],["o camarão","seafood"],["o morango","fruit"]])expect(foodSortingCategory({id:label,label,translation:""})?.id).toBe(`vocabulary:category:${id}`);
  for(const label of ["a sopa","o gelado","a mesa","a manga da camisa"])expect(foodSortingCategory({id:label,label,translation:""})).toBeUndefined();
  expect(canSortFood(words)).toBe(true);expect(canSortFood([words[0],...Array.from({length:8},(_,i)=>({id:`other${i}`,label:"a vaca",translation:"Корова"}))])).toBe(false);
  for(let index=0;index<12;index++){const options=foodSortingOptions(words[0],index);expect(new Set(options.map(option=>option.id)).size).toBe(3);expect(options.filter(option=>option.id===foodSortingCategory(words[0])?.id)).toHaveLength(1);}
  const fruit=wordBrowseSets(false).find(set=>set.id==="fruit")!;
  expect(foodSortingWords(fruit.words)).toEqual(fruit.words);expect(fruit.words.every(word=>foodSortingCategory(word)?.id==="vocabulary:category:fruit")).toBe(true);
  expect(foodSortingCategory({id:"potato",label:"a batata",translation:"Картофель"})?.id).toBe("vocabulary:category:vegetables");
});
it("allows retries, counts first attempts, and records one mistake per product",()=>{
  const mistake=vi.fn(),done=vi.fn();render(<FoodSorting words={words} child={false} onMistake={mistake} onComplete={done}/>);
  fireEvent.click(screen.getByRole("button",{name:/os legumes/}));fireEvent.click(screen.getByRole("button",{name:/os legumes/}));expect(mistake).toHaveBeenCalledExactlyOnceWith("apple");
  fireEvent.click(screen.getByRole("button",{name:/a fruta/}));fireEvent.click(screen.getByRole("button",{name:"Дальше"}));
  fireEvent.click(screen.getByRole("button",{name:/os laticínios/}));fireEvent.click(screen.getByRole("button",{name:"Дальше"}));
  fireEvent.click(screen.getByRole("button",{name:/o peixe e o marisco/}));fireEvent.click(screen.getByRole("button",{name:"Завершить"}));expect(screen.getByText("Готово · 2 / 3")).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"К активностям"}));expect(done).toHaveBeenCalledOnce();
});
it.each([false,true])("feeds the canonical food word into this profile's review deck; child=%s",child=>{
  let stored:ProfileLearning=emptyProfileLearning();
  function Harness({children}:{children:ReactNode}){const [learning,setLearning]=useState(stored);return <ProfileLearningContext value={{profile:{id:"sorting-test",child},learning,savingError:false,update:fn=>{stored=fn(stored);setLearning(stored);return true;}}}>{children}</ProfileLearningContext>;}
  const pack=wordLibraryFor(child).find(set=>set.id==="food")!,word=pack.words[0];
  render(<Harness><QuickWords child={child} sourceIds={["food"]} onBack={()=>{}}/></Harness>);
  fireEvent.click(screen.getByRole("button",{name:"Сортировка еды"}));expect(screen.getByRole("region",{name:"Сортировка еды"})).toBeVisible();
  expect(foodSortingCategory(word)?.id).toBe("vocabulary:category:grains");
  fireEvent.click(screen.getByRole("button",{name:/a fruta/}));fireEvent.click(screen.getByRole("button",{name:/a fruta/}));
  expect(stored.wordDeck).toHaveLength(1);expect(stored.wordDeck?.[0]).toMatchObject({wordId:word.id,errors:1,needsPractice:true,front:word.label});
  fireEvent.click(screen.getByRole("button",{name:/os cereais/}));expect(stored.wordDeck?.[0].errors).toBe(1);
  expect(wordSessionSchema.safeParse(stored.wordSession).success).toBe(true);expect(stored.wordSession?.mode).toBe("sorting");
});
