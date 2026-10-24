import {render,screen,fireEvent,within} from "@testing-library/react";
import {beforeEach,expect,it,vi} from "vitest";
import {Demo} from "@/github-pages/Demo";
import {loadProfiles,createProfile,profileStores} from "@/github-pages/profiles";
import {feelingWords} from "@/features/content/feelings-lesson";
beforeEach(()=>{localStorage.clear();window.history.replaceState(null,"","/tempo-react/");vi.spyOn(window,"scrollTo").mockImplementation(()=>{});});
it("restores the chosen avatar and derives the album from that profile's saved results",()=>{
  const view=render(<Demo/>);
  fireEvent.change(screen.getByRole("textbox",{name:"Имя"}),{target:{value:"Аня"}});
  fireEvent.click(screen.getByRole("radio",{name:"Совёнок"}));
  fireEvent.click(screen.getByRole("button",{name:"Создать профиль и начать"}));
  const profile=loadProfiles().profiles[0];expect(profile.avatar).toBe("owl");
  const stores=profileStores(profile.id),learning=stores.learning.load();
  stores.learning.save({...learning,feelings:{...learning.feelings,viewed:feelingWords.map(word=>word.id),practised:true}});
  view.unmount();render(<Demo/>);
  expect(screen.getByRole("img",{name:"Совёнок"})).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"Мои награды"}));
  const album=screen.getByRole("region",{name:"Альбом наград"});
  expect(within(album).getByText("значков собрано")).toBeVisible();
  expect(within(album).getByText("Чувства: закрепил!")).toBeVisible();
  expect(within(album).getAllByText("✓ Получено")).toHaveLength(2);
});
it("keeps the album out of the adult presentation",()=>{
  createProfile("Взрослый",false,false);render(<Demo/>);
  expect(screen.queryByRole("button",{name:"Мои награды"})).toBeNull();
});
