import {afterEach,expect,it,vi} from "vitest";
import {cleanup,fireEvent,render,screen,within} from "@testing-library/react";
import {IntroductionConversation} from "../../features/practice/IntroductionConversation";
import {introductionConversations,checkConversation,applyConversationCheck,emptyConversationEvidence,conversationIndependent} from "../../features/content/introduction-conversation";
import {IntroductionTopic} from "../../features/practice/IntroductionTopic";
import {ProfileLearningContext,emptyProfileLearning} from "../../features/practice/profile-learning";
afterEach(cleanup);
const button=(name:string)=>screen.getByRole("button",{name});
function answer(value:string,last=false){fireEvent.change(screen.getByRole("textbox",{name:"Ваша реплика"}),{target:{value}});fireEvent.click(button("Проверить реплику"));fireEvent.click(button(last?"Итог разговора":"Следующая реплика"));}

it("keeps both authored roles coherent and validates whole replies without dropping accents or negation",()=>{
  expect(introductionConversations.map(s=>s.turns.length)).toEqual([8,8]);
  for(const scene of introductionConversations)for(const turn of scene.turns)for(const value of turn.accepted)expect(checkConversation(turn,value.normalize("NFD")).accepted).toBe(true);
  const scene=introductionConversations[0];
  expect(checkConversation(scene.turns[4],"Eu não sou de França.").accepted).toBe(false);
  expect(checkConversation(scene.turns[4],"Sou de França mas vivo no Brasil").accepted).toBe(false);
  expect(checkConversation(scene.turns[3],"De onde es?").kind).toBe("writing");
  expect(checkConversation(scene.turns[2],"Chamo me Rita").kind).toBe("writing");
  expect(checkConversation(scene.turns[1],"Como está?").kind).toBe("meaning");
  expect(checkConversation(scene.turns[5],"Como está?").kind).toBe("form");
  expect(checkConversation(scene.turns[6],"Estou bem, obrigado.").kind).toBe("courtesy");
  expect(checkConversation(introductionConversations[1].turns[6],"Estou bem, obrigada.").kind).toBe("courtesy");
  expect(checkConversation(introductionConversations[1].turns[4],"Sou de França.").accepted).toBe(false);
});

it("never promotes repaired meaning or assisted work into independent evidence",()=>{
  const turn=introductionConversations[0].turns[4];
  const wrong=applyConversationCheck(emptyConversationEvidence(),checkConversation(turn,"Estou de França."));
  expect(conversationIndependent(applyConversationCheck(wrong,checkConversation(turn,turn.answer)))).toBe(false);
  const spelling=applyConversationCheck(emptyConversationEvidence(),checkConversation(turn,"Sou de Franca"));
  const fixed=applyConversationCheck(spelling,checkConversation(turn,turn.answer));expect(fixed.writing).toBe(true);expect(conversationIndependent(fixed)).toBe(true);
  expect(conversationIndependent({...fixed,help:1})).toBe(false);
});

it("finishes eight independent turns, accepts optional thanks, and starts the other role without exposing answers",()=>{
  render(<IntroductionConversation active/>);fireEvent.click(button("Самостоятельно"));
  for(const [i,turn] of introductionConversations[0].turns.entries())answer(i===6?"Estou bem.":turn.answer,i===7);
  expect(screen.getByText("Смысл всех восьми реплик передан самостоятельно.")).toBeVisible();
  expect(screen.getByRole("link",{name:"Представить близкого →"})).toHaveAttribute("href","/learning/introduction?phase=practice&activity=family");
  fireEvent.click(button("Новый разговор"));expect(screen.getByText(/Вы — Мигел из Бразилии/)).toBeVisible();fireEvent.click(button("Самостоятельно"));
  expect(screen.queryByText("Chamo-me Miguel.")).toBeNull();expect(screen.getByRole("textbox")).toHaveValue("");
});

it("repeats only helped turns with hidden models and preserves the original assistance",()=>{
  render(<IntroductionConversation active/>);fireEvent.click(button("Самостоятельно"));
  fireEvent.click(button("Подсказка"));fireEvent.click(button("Начало реплики"));fireEvent.click(button("Показать образец"));
  for(const [i,turn] of introductionConversations[0].turns.entries())answer(turn.answer,i===7);
  expect(screen.getByText("Поздороваться: с помощью")).toBeVisible();fireEvent.click(button("Повторить трудные реплики"));
  expect(screen.getByRole("heading",{name:"Повтор 1 из 1 · Поздороваться"})).toBeVisible();
  expect(screen.queryByText(/^С помощью:/)).toBeNull();expect(button("Подсказка")).toBeVisible();
  answer("Bom dia!",true);expect(screen.getByText("Поздороваться: с помощью")).toBeVisible();expect(screen.getByText(/Тренировочный повтор завершён/)).toBeVisible();
});

it("keeps drafts through phases, isolates profiles, and makes no writes to existing results",()=>{
  const learning=emptyProfileLearning(),update=vi.fn(),before=structuredClone(learning);
  const wrap=(id:string,phase="practice",child=false)=><ProfileLearningContext value={{profile:{id,child},learning,savingError:false,update}}><IntroductionTopic phase={phase} onBack={vi.fn()}/></ProfileLearningContext>;
  const view=render(wrap("one"));fireEvent.click(button("Применить в разговоре"));fireEvent.click(button("Самостоятельно"));
  fireEvent.change(screen.getByRole("textbox"),{target:{value:"мой черновик"}});
  view.rerender(wrap("one","explanation"));view.rerender(wrap("one"));expect(screen.getByRole("textbox")).toHaveValue("мой черновик");
  view.rerender(wrap("two"));expect(button("Самостоятельно")).toBeVisible();expect(screen.queryByRole("textbox")).toBeNull();
  view.rerender(wrap("child","practice",true));expect(screen.queryByRole("button",{name:"Применить в разговоре"})).toBeNull();
  expect(update).not.toHaveBeenCalled();expect(learning).toEqual(before);
});

it("isolates the family bridge by profile, including a child opening its direct link",()=>{
  const learning=emptyProfileLearning(),update=vi.fn();
  const wrap=(id:string,child=false)=><ProfileLearningContext value={{profile:{id,child},learning,savingError:false,update}}><IntroductionTopic phase="practice" familyBridge onBack={vi.fn()}/></ProfileLearningContext>;
  const view=render(wrap("adult-a"));
  const bridge=within(screen.getByRole("region",{name:"Представить близкого"}));
  fireEvent.click(bridge.getByRole("button",{name:"a"}));
  fireEvent.click(bridge.getByRole("button",{name:"Перейти к вопросу →"}));
  expect(bridge.getByRole("textbox")).toBeVisible();
  view.rerender(wrap("adult-b"));
  expect(screen.getByRole("heading",{name:"Брат или сестра?"})).toBeVisible();
  view.rerender(wrap("child",true));
  expect(screen.queryByRole("region",{name:"Представить близкого"})).toBeNull();
  expect(update).not.toHaveBeenCalled();
});
