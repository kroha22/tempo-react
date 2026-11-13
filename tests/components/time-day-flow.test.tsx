import {afterEach,beforeEach,expect,it,vi} from "vitest";
import {act,fireEvent,render,screen,within} from "@testing-library/react";
import {LegacyDemo} from "@/github-pages/Demo";
import {activateLocalTransport} from "@/shared/http/local-transport";
import {createLocalLearningApi} from "@/github-pages/local-learning-api";
import {emptyLocalLearning,localLearningSchema,type LearningStore} from "@/github-pages/local-learning-store";
import {timeDayWords,timeDayHref} from "@/features/content/time-day";
import {gramaticaVocabulary} from "@/features/content/gramatica-vocabulary";
import {studyReviewCardById} from "@/features/cards/study-review/catalog";
import {StudyReview} from "@/features/cards/study-review/StudyReview";
import {learningCatalog} from "@/features/content/learning-catalog";
let deactivate:(()=>void)|undefined;
beforeEach(()=>{localStorage.clear();window.history.replaceState(null,"",`/tempo-react/#${timeDayHref("hours","practice")}`);vi.spyOn(window,"scrollTo").mockImplementation(()=>{});});
afterEach(()=>deactivate?.());
function setup(){let data=emptyLocalLearning();const store:LearningStore={read:async()=>structuredClone(data),update:async change=>{data=localLearningSchema.parse(change(structuredClone(data)));return structuredClone(data);},close(){}};const api=createLocalLearningApi(store);deactivate=activateLocalTransport(api);return {store,api};}
const post=(body:unknown)=>({method:"POST",body:JSON.stringify(body)});

it("keeps the clock answer through all steps, another topic and browser-style hash restoration",async()=>{
  setup();render(<LegacyDemo/>);
  const clock=within(screen.getByRole("region",{name:"Часы: короткие блоки"}));
  fireEvent.change(clock.getByRole("textbox"),{target:{value:"São sete"}});
  fireEvent.click(within(screen.getByRole("region",{name:"Практика темы"})).getByRole("button",{name:"Выбрать вариант 1"}));
  fireEvent.click(screen.getByRole("link",{name:"2 · Слова"}));
  expect(await screen.findByRole("heading",{name:"Часы · Слова"})).toBeVisible();
  fireEvent.click(within(screen.getByRole("navigation",{name:"Разделы темы"})).getByRole("link",{name:"Месяцы"}));
  fireEvent.click(within(screen.getByRole("navigation",{name:"Разделы темы"})).getByRole("link",{name:"Часы"}));
  fireEvent.click(screen.getByRole("link",{name:"3 · Задания"}));
  expect(within(screen.getByRole("region",{name:"Часы: короткие блоки"})).getByRole("textbox")).toHaveValue("São sete");
  expect(within(screen.getByRole("region",{name:"Практика темы"})).getByRole("button",{name:"Выбрать вариант 1"})).toHaveAttribute("aria-pressed","true");
  expect(window.location.hash).toContain("topic=hours&phase=practice");
  act(()=>{window.history.replaceState(null,"",`/tempo-react/#${timeDayHref("hours","words")}`);window.dispatchEvent(new HashChangeEvent("hashchange"));});
  expect(screen.getByRole("heading",{name:"Часы · Слова"})).toBeVisible();
  fireEvent.click(screen.getByRole("link",{name:"3 · Задания"}));
  expect(within(screen.getByRole("region",{name:"Часы: короткие блоки"})).getByRole("textbox")).toHaveValue("São sete");
});

it("keeps the existing month ordering and day choices when leaving and returning to practice",()=>{
  setup();window.history.replaceState(null,"",`/tempo-react/#${timeDayHref("months","practice")}`);render(<LegacyDemo/>);
  fireEvent.click(screen.getByRole("button",{name:"Порядок и дни"}));
  fireEvent.click(within(screen.getByRole("group",{name:"Перепутанные месяцы"})).getByRole("button",{name:"janeiro"}));
  fireEvent.click(screen.getByRole("checkbox",{name:"31 dias: janeiro"}));
  fireEvent.click(screen.getByRole("link",{name:"2 · Слова"}));
  fireEvent.click(screen.getByRole("link",{name:"3 · Задания"}));
  expect(screen.getByRole("button",{name:"Порядок и дни"})).toHaveAttribute("aria-pressed","true");
  expect(within(screen.getByRole("group",{name:"Перепутанные месяцы"})).getByRole("button",{name:"janeiro"})).toBeDisabled();
  expect(screen.getByRole("checkbox",{name:"31 dias: janeiro"})).toBeChecked();
});

it("adds a source to an existing rated card without changing its ID, review or other sources",async()=>{
  const {store,api}=setup(),word=timeDayWords.find(word=>word.pt==="acordar")!;
  await api("/api/study-items",post({studyItemId:word.studyItemId,sourceType:"lesson",sourceId:"lesson:old:source",clientEventId:`card:${crypto.randomUUID()}`}));
  await api("/api/study-reviews",post({studyItemId:word.studyItemId,clientEventId:`review:${crypto.randomUUID()}`,grade:2,expectedVersion:0}));
  const before=(await store.read()).reviews[0];window.history.replaceState(null,"",`/tempo-react/#${timeDayHref("routine","words")}`);render(<LegacyDemo/>);
  const article=screen.getByText("acordar",{selector:"strong"}).closest("article")!;
  fireEvent.click(await within(article).findByRole("button",{name:"В карточки"}));
  await within(article).findByRole("button",{name:"Уже в карточках ✓"});
  const after=await store.read();expect(after.items).toHaveLength(1);expect(after.reviews[0]).toEqual(before);
  expect(after.sources.map(source=>source.sourceId).sort()).toEqual(["lesson:old:source","lesson:time-day:routine"].sort());
});

it("saves and reviews only this theme while retaining unrelated SRS rows",async()=>{
  const {store,api}=setup(),word=timeDayWords.find(word=>word.topic==="hours")!,other=gramaticaVocabulary.find(row=>!timeDayWords.some(word=>word.studyItemId===row.studyItemId))!;
  await api("/api/study-items",post({studyItemId:other.studyItemId,sourceType:"lesson",sourceId:"lesson:other:source",clientEventId:`card:${crypto.randomUUID()}`}));
  const unrelated=(await store.read()).reviews[0];window.history.replaceState(null,"",`/tempo-react/#${timeDayHref("hours","words")}`);render(<LegacyDemo/>);
  const article=screen.getByText(word.pt,{selector:"strong"}).closest("article")!;
  fireEvent.click(await within(article).findByRole("button",{name:"В карточки"}));
  await within(article).findByRole("button",{name:"Уже в карточках ✓"});
  fireEvent.click(screen.getByRole("link",{name:"4 · Повторение"}));
  expect(await screen.findByRole("heading",{name:"Повторение темы"})).toBeVisible();
  expect(window.location.hash).toContain("phase=review");
  fireEvent.click(await screen.findByRole("button",{name:"Показать ответ"}));
  expect(within(screen.getByRole("button",{name:"Скрыть ответ"})).getByText(word.pt,{selector:"strong"})).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:/^Помню ·/}));
  await screen.findByText(/Оценка сохранена/);
  const after=await store.read();expect(after.reviews.find(row=>row.studyItemId===other.studyItemId)).toEqual(unrelated);
  expect(after.reviews.find(row=>row.studyItemId===word.studyItemId)?.version).toBe(1);
  act(()=>{window.history.replaceState(null,"","/tempo-react/#/learning/gramatica-ativa/review");window.dispatchEvent(new HashChangeEvent("hashchange"));});
  const globalCard=await screen.findByRole("button",{name:"Показать ответ"});
  expect(within(globalCard).getByText(studyReviewCardById.get(other.studyItemId)!.front)).toBeVisible();
});

it("an explicitly empty review selection does not fall back to the whole deck",async()=>{
  const {api}=setup(),other=gramaticaVocabulary[0];
  await api("/api/study-items",post({studyItemId:other.studyItemId,sourceType:"lesson",sourceId:"lesson:other:source",clientEventId:`card:${crypto.randomUUID()}`}));
  render(<StudyReview studyItemIds={[]} embedded/>);
  expect(await screen.findByRole("heading",{name:"Пока нет сохранённых карточек"})).toBeVisible();
  expect(screen.queryByRole("button",{name:"Показать ответ"})).not.toBeInTheDocument();
});

it("returns from related grammar to the same routine answer without replacing the lesson",()=>{
  setup();window.history.replaceState(null,"",`/tempo-react/#${timeDayHref("routine","practice")}`);render(<LegacyDemo/>);
  const task=learningCatalog.usageModules.find(module=>module.id==="usage:my-day")!.exercises[0];
  const answer=task.options.find(option=>option.id===task.correctOptionId)!.text;
  fireEvent.click(screen.getByRole("button",{name:answer}));
  fireEvent.click(screen.getByRole("link",{name:"Грамматика: настоящее время →"}));
  expect(window.location.hash).toContain("related=");
  fireEvent.click(screen.getByRole("button",{name:"← К уроку «Время и мой день»"}));
  expect(screen.getByRole("button",{name:answer})).toHaveAttribute("aria-pressed","true");
  expect(window.location.hash).not.toContain("related=");
});
