import {expect,it} from "vitest";
import {render,screen,fireEvent} from "@testing-library/react";
import {wordBrowseSets} from "@/features/content/word-browse-sets";
import {wordSetMatchesSearch} from "@/features/content/word-set-search";
import {QuickWords} from "@/features/practice/QuickWords";

it.each([false,true])("finds sets by Portuguese and Russian vocabulary without changing them (%s)",child=>{
  const sets=wordBrowseSets(child),before=JSON.stringify(sets);
  const food=sets.find(set=>set.id==="food")!;
  for(const query of ["leite","МОЛОКО","  LeItE  ","pao","pão","молоко хлеб"])
    expect(wordSetMatchesSearch(food,query)).toBe(true);
  expect(wordSetMatchesSearch(food,"несуществующееслово")).toBe(false);
  expect(sets.filter(set=>wordSetMatchesSearch(set,"camisola")).some(set=>/Одежда/.test(set.title))).toBe(true);
  const colors=sets.find(set=>set.id==="colors-basic")!;
  expect(wordSetMatchesSearch(colors,"жёлтый")).toBe(true);
  expect(wordSetMatchesSearch(colors,"желтый")).toBe(true);
  expect(wordSetMatchesSearch(sets.find(set=>set.id==="basic-irregular")!,"POR")).toBe(true);
  expect(sets.every(set=>wordSetMatchesSearch(set,"   "))).toBe(true);
  expect(wordSetMatchesSearch(food,"Alimentos")).toBe(true);
  expect(JSON.stringify(sets)).toBe(before);
});

it.each([false,true])("shows vocabulary matches immediately and preserves search on return (%s)",child=>{
  render(<QuickWords child={child} onBack={()=>{}}/>);
  const search=screen.getByRole("searchbox",{name:"Найти подборку"});
  const foodName="Alimentos e bebidas Продукты и напитки 17 карточек";
  expect(screen.queryByRole("button",{name:foodName})).not.toBeInTheDocument();
  fireEvent.change(search,{target:{value:"молоко"}});
  fireEvent.click(screen.getByRole("button",{name:foodName}));
  fireEvent.click(screen.getByRole("button",{name:"Все наборы"}));
  expect(screen.getByRole("searchbox")).toHaveValue("молоко");
  expect(screen.getByRole("button",{name:foodName})).toBeVisible();
  fireEvent.change(screen.getByRole("searchbox"),{target:{value:"PAO"}});
  expect(screen.getByRole("button",{name:foodName})).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"Глаголы"}));
  expect(screen.queryByRole("button",{name:foodName})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button",{name:"Все"}));
  expect(screen.getByRole("button",{name:foodName})).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"Очистить поиск"}));
  expect(screen.getByRole("searchbox")).toHaveValue("");
  expect(screen.queryByRole("button",{name:foodName})).not.toBeInTheDocument();
});
