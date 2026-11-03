import {render,screen,fireEvent,within} from "@testing-library/react";
import {beforeEach,expect,it,vi} from "vitest";
import {Demo} from "@/github-pages/Demo";
import {loadProfiles,createProfile,profileStores} from "@/github-pages/profiles";
import {feelingWords} from "@/features/content/feelings-lesson";
vi.mock("@/github-pages/LocalLearningBoundary",()=>({LocalLearningBoundary:({children}:{children:React.ReactNode})=>children}));
beforeEach(()=>{localStorage.clear();window.history.replaceState(null,"","/tempo-react/");vi.spyOn(window,"scrollTo").mockImplementation(()=>{});});
it("preserves a legacy avatar and derives the album from that profile's saved results",()=>{
  createProfile("Аня",true,false,"owl");
  const view=render(<Demo/>);
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
