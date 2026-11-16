import {expect,it} from "vitest";
import {wordBrowseSets} from "@/features/content/word-browse-sets";
import {wordCollections} from "@/features/content/word-collections";
import {render,screen,fireEvent} from "@testing-library/react";
import {QuickWords} from "@/features/practice/QuickWords";
it.each([false,true])("starts collapsed, opens on click and reveals search results (%s)",child=>{
  render(<QuickWords child={child} onBack={()=>{}}/>);
  expect([...document.querySelectorAll("details")].every(el=>!el.open)).toBe(true);
  expect(screen.getByRole("button",{name:/Os meses Месяцы/})).not.toBeVisible();
  fireEvent.click(screen.getByText("Время и календарь",{exact:true}));
  expect(screen.getByRole("button",{name:/Os meses Месяцы/})).toBeVisible();
  fireEvent.change(screen.getByRole("searchbox"),{target:{value:"цвет"}});
  expect(screen.getByRole("button",{name:/As cores Цвета/})).toBeVisible();
  fireEvent.click(screen.getByText("Цвета и одежда",{exact:true}));
  expect(screen.getByRole("button",{name:/As cores Цвета/})).not.toBeVisible();
  fireEvent.change(screen.getByRole("searchbox"),{target:{value:"цвета"}});
  expect(screen.getByRole("button",{name:/As cores Цвета/})).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"Очистить поиск"}));
  expect([...document.querySelectorAll("details")].every(el=>!el.open)).toBe(true);
});
it.each([false,true])("groups calendar vocabulary without copying or losing source sets (%s)",child=>{
  const sets=wordBrowseSets(child),groups=wordCollections(sets);
  const calendar=groups.find(group=>group.title==="Время и календарь")!;
  expect(calendar.sets.some(set=>set.title==="Месяцы")).toBe(true);
  expect(calendar.sets.some(set=>set.title==="Дни недели")).toBe(true);
  const all=groups.flatMap(group=>group.sets);expect(all).toHaveLength(sets.length);
  expect(new Set(all.map(set=>set.id)).size).toBe(sets.length);
  for(const set of sets)expect(all).toContain(set);
});
