import {beforeEach,expect,test,vi} from "vitest";
import {act,fireEvent,render,screen,within} from "@testing-library/react";
import {LegacyDemo} from "@/github-pages/Demo";
import {RelatedLearning} from "@/github-pages/RelatedLearning";
import {beingDestination,beingDestinationForHref,beingHref} from "@/features/practice/being-navigation";
import {browserPracticePlanStorage,practicePlanStorageKey} from "@/github-pages/practice-plan-storage";

beforeEach(()=>{localStorage.clear();window.history.replaceState(null,"","/tempo-react/");vi.spyOn(window,"scrollTo").mockImplementation(()=>{});});
test("legacy explanation and present-form URLs resolve to the same three destinations, without capturing past or child free practice",()=>{
  for(const lesson of ["ser","estar","ser-estar"])expect(beingDestination({lesson})?.view).toBe("explanation");
  expect(beingDestination({verb:"ser",tense:"present"})).toEqual({view:"forms",verb:"ser"});
  expect(beingDestination({verb:"estar"})).toEqual({view:"forms",verb:"estar"});
  expect(beingDestination({verb:"ser",tense:"past"})).toBeNull();
  expect(beingDestination({verb:"ser",mode:"kingdoms"})).toBeNull();
  expect(beingDestination({lesson:"unknown",verb:"ser"})).toBeNull();
  expect(beingDestinationForHref("/learning/other?lesson=ser")).toBeNull();
  expect(beingDestinationForHref(beingHref("forms","estar",true))).toEqual({view:"forms",verb:"estar"});
});
test.each(["ser","estar","ser-estar"])("old lesson %s shows one explanation, explicit form links and the original checks",id=>{
  render(<RelatedLearning href={`/learning/practice?lesson=${id}`} onBack={vi.fn()}/>);
  expect(screen.getAllByRole("region",{name:"Общее объяснение SER и ESTAR"})).toHaveLength(1);
  expect(screen.queryByRole("button",{name:/Потренировать формы/})).not.toBeInTheDocument();
  expect(screen.queryByRole("button",{name:/Все спряжения/})).not.toBeInTheDocument();
  expect(screen.getByRole("link",{name:"Формы SER →"})).toHaveAttribute("href",beingHref("forms","ser"));
  expect(screen.getByRole("link",{name:"Формы ESTAR →"})).toHaveAttribute("href",beingHref("forms","estar"));
  expect(screen.getByRole("link",{name:"Объяснение и выбор глагола"})).toHaveAttribute("aria-current","page");
  for(const prompt of ["O Rui ___ português.","Nós ___ no centro.","A sopa ___ quente agora."])expect(screen.getByRole("region",{name:prompt})).toBeVisible();
});
test("form navigation and browser return keep in-progress placements, checked answers and stable completion IDs",async()=>{
  window.history.replaceState(null,"",`/tempo-react/#/learning/practice?lesson=ser`);
  render(<LegacyDemo/>);
  fireEvent.click(within(screen.getByRole("region",{name:"O Rui ___ português."})).getByRole("button",{name:"é"}));
  const before=localStorage.getItem(practicePlanStorageKey);
  expect(browserPracticePlanStorage.load().completed["practice:grammar:ser"]?.needsReview).toBe(false);
  fireEvent.click(screen.getByRole("link",{name:"Формы SER →"}));
  expect(location.hash).toContain("view=forms&verb=ser");
  expect(screen.queryByRole("region",{name:"Общее объяснение SER и ESTAR"})).not.toBeInTheDocument();
  expect(screen.getByRole("heading",{name:"Формы SER · настоящее время"})).toHaveFocus();
  fireEvent.click(screen.getByRole("button",{name:"Собрать формы"}));
  fireEvent.click(within(screen.getByRole("complementary",{name:"Формы глагола для расстановки"})).getByRole("button",{name:/sou$/}));
  fireEvent.click(screen.getByRole("button",{name:"Форма для Eu"}));
  expect(screen.getByRole("button",{name:"Форма для Eu"})).toHaveTextContent("sou");
  fireEvent.click(screen.getByRole("link",{name:"Формы ESTAR"}));
  expect(screen.getByRole("heading",{name:"Формы ESTAR · настоящее время"})).toHaveFocus();
  fireEvent.click(screen.getByRole("link",{name:"Формы SER"}));
  expect(screen.getByRole("button",{name:"Форма для Eu"})).toHaveTextContent("sou");
  fireEvent.click(screen.getByRole("link",{name:"← К объяснению SER и ESTAR"}));
  expect(within(screen.getByRole("region",{name:"O Rui ___ português."})).getByRole("button",{name:"é"})).toBeDisabled();
  expect(localStorage.getItem(practicePlanStorageKey)).toBe(before);
  // Simulate the hash restored by browser history, without clicking the in-app return link.
  act(()=>{window.history.replaceState(null,"",`/tempo-react/#${beingHref("forms","ser")}`);window.dispatchEvent(new HashChangeEvent("hashchange"));});
  expect(screen.getByRole("button",{name:"Форма для Eu"})).toHaveTextContent("sou");
});
test("a direct ESTAR training URL opens its forms and a named return, not a second explanation",()=>{
  render(<RelatedLearning href="/learning/practice?verb=estar&tense=present" onBack={vi.fn()}/>);
  expect(screen.getByRole("heading",{name:"Формы ESTAR · настоящее время"})).toBeVisible();
  expect(screen.getByRole("region",{name:"Тренажёр форм ESTAR"})).toBeVisible();
  expect(screen.queryByRole("region",{name:"Общее объяснение SER и ESTAR"})).not.toBeInTheDocument();
  expect(screen.getByRole("link",{name:"← К объяснению SER и ESTAR"})).toHaveAttribute("href",beingHref());
});
test("focused forms retain the existing choose and reverse exercises",()=>{
  render(<RelatedLearning href={beingHref("forms","ser")} onBack={vi.fn()}/>);
  fireEvent.click(screen.getByRole("button",{name:"Выбрать форму"}));
  fireEvent.click(screen.getByRole("button",{name:"és"}));
  expect(screen.getByText("Верно! Muito bem!")).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"Узнать местоимение"}));
  fireEvent.click(screen.getByRole("button",{name:"Ele / ela"}));
  expect(screen.getByText("Верно! Muito bem!")).toBeVisible();
});
