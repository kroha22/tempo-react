import {expect,test} from "@playwright/test";
import {browserNow,legacyBackup} from "./fixtures/legacy-profile";
import {createAdult,exportBackup,importBackup,expectNoOverflow} from "./learning.helpers";
import {wordBrowseSets} from "../../features/content/word-browse-sets";
import {topicForWordSet} from "../../features/content/topic-navigation";
const topics=[
  {id:"topic:work",title:"Работа и учёба",href:"/learning/work-study"},
  {id:"topic:city",title:"Город и дорога",href:"/learning/city"},
  {id:"foundation:hello",title:"Знакомство и первые фразы",href:"/learning/introduction"},
  {id:"topic:vocabulary-clothing",title:"Одежда и цвета",href:"/learning/clothing"},
  {id:"topic:vocabulary-cooperation",title:"Сотрудничество и общение",href:"/learning/plan/school?unit=cooperation"},
  {id:"topic:reading",title:"Буквы и чтение",href:"/learning/reading"},
  {id:"topic:vocabulary-family",title:"Моя семья и близкие",href:"/learning/family?topic=close&phase=explanation"},
  {id:"topic:food",title:"Еда и предпочтения",href:"/learning/food?topic=fruit&phase=explanation"},
  {id:"topic:vocabulary-calendar",title:"Время и мой день",href:"/learning/time-day?topic=hours&phase=explanation"},
  {id:"topic:vocabulary-body",title:"Тело и здоровье",href:"/learning/body?topic=face&phase=explanation"},
  {id:"topic:vocabulary-house",title:"Дом и расположение",href:"/learning/home?topic=rooms&phase=explanation"},
];
test.beforeEach(async({page})=>{await page.clock.setFixedTime(browserNow);await page.goto("./");await createAdult(page,"Topic QA");});
test("work route and legacy entry retain the original pair result and return to their origin",async({page})=>{
  const backup=legacyBackup();backup.browser.learning.activities={...backup.browser.learning.activities,"pairs:collection:vocabulary-lesson:work":{title:"Работа и встречи",group:"Слова и игры",correct:6,total:6}};
  await importBackup(page,backup);const before=await exportBackup(page);
  await page.goto("#/learning/plan");const everyday=page.locator("summary").filter({hasText:"Повседневные темы"}).locator("..");await everyday.locator("summary").first().click();await everyday.locator("summary").filter({hasText:"Работа и учёба"}).click();await everyday.getByRole("link",{name:"Открыть урок: Работа и учёба →",exact:true}).click();
  await page.getByRole("button",{name:/^Pares/}).click();await expect(page.getByRole("heading",{name:"Найди перевод",exact:true})).toBeVisible();await expectNoOverflow(page);await page.getByRole("button",{name:"Назад",exact:true}).click();await expect(page.getByRole("heading",{name:"Общий план",exact:true})).toBeVisible();
  await page.goto("#/learning/topics");const entry=page.getByRole("region",{name:"Тема: Работа и учёба",exact:true});await entry.locator("summary").click();await entry.getByRole("button",{name:"Работа и встречи: прежние наборы и задания",exact:true}).click();await page.getByRole("button",{name:/^Pares/}).click();await expect(page.getByRole("heading",{name:"Найди перевод",exact:true})).toBeVisible();await page.getByRole("button",{name:"Назад ко всем темам",exact:true}).click();await expect(entry).toBeVisible();
  await page.goto("#/learning/plan");await page.reload();const after=await exportBackup(page);expect(after.browser.learning.activities).toEqual(before.browser.learning.activities);expect(after.learning).toEqual(before.learning);expect(after.browser.cards).toEqual(before.browser.cards);
});
test("city route and legacy entry reuse street and park without changing existing results",async({page})=>{
  const backup=legacyBackup();backup.browser.learning.activities={...backup.browser.learning.activities,"image:image-street":{title:"На нашей улице",group:"Слова и игры",correct:8,total:8},"image:image-park":{title:"В парке",group:"Слова и игры",correct:7,total:7}};
  await importBackup(page,backup);const before=await exportBackup(page);
  await page.goto("#/learning/plan");const everyday=page.locator("summary").filter({hasText:"Повседневные темы"}).locator("..");await everyday.locator("summary").first().click();await everyday.locator("summary").filter({hasText:"Город и дорога"}).click();await everyday.getByRole("link",{name:"Открыть урок: Город и дорога →",exact:true}).click();
  await page.getByRole("button",{name:/^Imagem/}).click();await expect(page.getByRole("img",{name:"Иллюстрация к заданию «На нашей улице»"})).toBeVisible();await page.getByRole("combobox",{name:"Картинка",exact:true}).selectOption("image-park");await expect(page.getByRole("img",{name:"Иллюстрация к заданию «В парке»"})).toBeVisible();await expectNoOverflow(page);
  await page.getByRole("button",{name:"Назад",exact:true}).click();await expect(page.getByRole("heading",{name:"Общий план",exact:true})).toBeVisible();
  await page.goto("#/learning/topics");const entry=page.getByRole("region",{name:"Тема: Город и дорога",exact:true});await entry.locator("summary").click();await entry.getByRole("button",{name:"Город: прежние наборы и сцены",exact:true}).click();await page.getByRole("button",{name:/^Imagem/}).click();await expect(page.getByRole("img",{name:"Иллюстрация к заданию «На нашей улице»"})).toBeVisible();
  await page.goto("#/learning/plan");await page.reload();const after=await exportBackup(page);expect(after.browser.learning.activities).toEqual(before.browser.learning.activities);expect(after.learning).toEqual(before.learning);expect(after.browser.cards).toEqual(before.browser.cards);
});
test("introduction reuses both foundation lessons, retains an answer and keeps old results",async({page})=>{
  const backup=legacyBackup();backup.browser.learning.activities={...backup.browser.learning.activities,"greetings:hello":{title:"Поздороваться",group:"Первые фразы",correct:1,total:1},"foundation:first-steps:identity":{title:"Кто я",group:"Первые фразы",correct:1,total:1}};
  await importBackup(page,backup);const before=await exportBackup(page);
  await page.goto("#/learning/plan");const everyday=page.locator("summary").filter({hasText:"Повседневные темы"}).locator("..");await everyday.locator("summary").first().click();await everyday.locator("summary").filter({hasText:"Знакомство и первые фразы"}).click();await everyday.getByRole("link",{name:"Открыть урок: Знакомство и первые фразы →",exact:true}).click();
  await page.getByRole("button",{name:"Практика диалога",exact:true}).click();await page.getByRole("button",{name:"Bom dia!",exact:true}).click();await page.getByRole("button",{name:"Рассказать о себе",exact:true}).click();await expect(page.getByRole("heading",{name:"Quem sou? — Кто я",exact:true})).toBeVisible();await page.getByRole("button",{name:"Приветствия",exact:true}).click();await expect(page.getByRole("button",{name:"Bom dia!",exact:true})).toHaveAttribute("aria-pressed","true");await expectNoOverflow(page);
  await page.getByRole("button",{name:"← Назад",exact:true}).click();await expect(page.getByRole("heading",{name:"Общий план",exact:true})).toBeVisible();
  await page.goto("#/learning/topics");const entry=page.getByRole("region",{name:"Тема: Знакомство и первые фразы",exact:true});await entry.locator("summary").click();await entry.getByRole("button",{name:"Quem sou? — Кто я",exact:true}).click();await expect(page.getByRole("heading",{name:"Quem sou? — Кто я",exact:true})).toBeVisible();
  await page.goto("#/learning/plan");await page.reload();const after=await exportBackup(page);expect(after.browser.learning.activities).toEqual(before.browser.learning.activities);expect(after.learning).toEqual(before.learning);expect(after.browser.cards).toEqual(before.browser.cards);
});
test("clothing route reuses the wardrobe activity, returns to plan and preserves its old result",async({page})=>{
  const backup=legacyBackup();backup.browser.learning.activities={...backup.browser.learning.activities,"image-clothing":{title:"Что сегодня надеть?",group:"Слова в жизни",correct:10,total:10}};
  await importBackup(page,backup);const before=await exportBackup(page);
  await page.goto("#/learning/plan");const everyday=page.locator("summary").filter({hasText:"Повседневные темы"}).locator("..");await everyday.locator("summary").first().click();await everyday.locator("summary").filter({hasText:"Одежда и цвета"}).click();await everyday.getByRole("link",{name:"Открыть урок: Одежда и цвета →",exact:true}).click();
  await page.getByRole("button",{name:/^Imagem/}).click();await expect(page.getByRole("img",{name:"Открытый гардероб с одеждой, пижамой, шарфом и туфлями"})).toBeVisible();await expectNoOverflow(page);
  await page.getByRole("button",{name:"Назад",exact:true}).click();await expect(page.getByRole("heading",{name:"Общий план",exact:true})).toBeVisible();
  await page.goto("#/learning/topics");const entry=page.getByRole("region",{name:"Тема: Одежда и цвета",exact:true});await entry.locator("summary").click();await entry.getByRole("button",{name:"Одежда: прежние наборы и задания",exact:true}).click();await page.getByRole("button",{name:/^Imagem/}).click();await expect(page.getByRole("img",{name:"Открытый гардероб с одеждой, пижамой, шарфом и туфлями"})).toBeVisible();
  await page.goto("#/learning/plan");await page.reload();const after=await exportBackup(page);expect(after.browser.learning.activities).toEqual(before.browser.learning.activities);expect(after.learning).toEqual(before.learning);expect(after.browser.cards).toEqual(before.browser.cards);
});
test("cooperation lesson and legacy stages retain both existing activity results",async({page})=>{
  const backup=legacyBackup();backup.browser.learning.activities={...backup.browser.learning.activities,"prep:cooperation":{title:"Общение",group:"Слова в жизни",correct:2,total:2},"usage:cooperation:rules":{title:"Общение",group:"Слова в жизни",correct:3,total:3}};
  await importBackup(page,backup);const before=await exportBackup(page);
  await page.goto("#/learning/plan/school?unit=cooperation");await expect(page.getByRole("heading",{name:"Общение и конфликты",level:1})).toBeVisible();
  await page.getByRole("button",{name:"Praticar",exact:true}).click();
  await page.getByRole("button",{name:/Общаемся и договариваемся: комикс и практика/}).click();
  const lesson=page.getByRole("region",{name:"Общаемся и договариваемся: уроки",exact:true});await expect(lesson).toBeVisible();await expect(lesson.getByRole("navigation",{name:"Шаги общения"}).getByRole("button")).toHaveCount(3);
  await page.goto("#/learning/topics");const entry=page.getByRole("region",{name:"Тема: Сотрудничество и общение",exact:true});await entry.locator("summary").click();
  await entry.getByRole("button",{name:"Общаемся и договариваемся: прежние уроки",exact:true}).click();await expect(lesson).toBeVisible();
  await page.goto("#/learning/plan");await page.reload();const after=await exportBackup(page);
  expect(after.browser.learning.activities).toEqual(before.browser.learning.activities);expect(after.learning).toEqual(before.learning);expect(after.browser.cards).toEqual(before.browser.cards);
});
test("reading route and old catalogue entry share ten lessons and retain an existing spelling result",async({page})=>{
  const backup=legacyBackup();backup.browser.learning.activities={...backup.browser.learning.activities,"prep:phonics:r-rr":{title:"R/RR",group:"Слова в жизни",correct:12,total:12}};
  await importBackup(page,backup);const before=await exportBackup(page);
  await page.goto("#/learning/reading");await expect(page.getByText("10 тем · 10 всего",{exact:true})).toBeVisible();
  await page.getByRole("button",{name:/R ou RR/}).click();await expect(page.getByRole("button",{name:"Praticar",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"← К буквам и чтению",exact:true}).click();
  await page.goto("#/learning/topics");const entry=page.getByRole("region",{name:"Тема: Буквы и чтение",exact:true});await entry.locator("summary").click();
  await entry.getByRole("button",{name:"Буквы и чтение",exact:true}).click();await expect(page.getByText("10 тем · 10 всего",{exact:true})).toBeVisible();
  await page.goto("#/learning/plan");await page.reload();const after=await exportBackup(page);
  expect(after.browser.learning.activities).toEqual(before.browser.learning.activities);expect(after.learning).toEqual(before.learning);expect(after.browser.cards).toEqual(before.browser.cards);
});
for(const [index,batch] of Array.from({length:Math.ceil(topics.length/5)},(_,index)=>topics.slice(index*5,index*5+5)).entries())test(`plan, catalogue and words preserve canonical entries and old saves (batch ${index+1})`,async({page},info)=>{
  await importBackup(page,legacyBackup());const before=await exportBackup(page);
  await page.goto("#/learning/plan");const everyday=page.locator("summary").filter({hasText:"Повседневные темы"}).locator("..");await everyday.locator("summary").first().click();
  for(const topic of batch){
    if(topic.id==="topic:reading"||topic.id==="topic:vocabulary-cooperation"){
      const school=page.locator("summary").filter({hasText:"Буквы и школьные темы"}).locator("..");if(!await school.evaluate(node=>(node as HTMLDetailsElement).open))await school.locator("summary").first().click();
      await school.locator("summary").filter({hasText:topic.title}).click();
      await expect(school.locator(`a[href="#${topic.href}"]`)).toBeVisible();continue;
    }
    await everyday.locator("summary").filter({hasText:topic.title}).click();
    await expect(everyday.locator(`a[href="#${topic.href}"]`)).toBeVisible();
  }
  await page.goto("#/learning/topics");
  for(const topic of batch){
    const entry=page.getByRole("region",{name:`Тема: ${topic.title}`,exact:true});await expect(entry).toHaveCount(1);
    await expect(entry.locator(`a[href="#${topic.href}"]`)).toBeVisible();
    if(!await entry.locator("details").evaluate(node=>(node as HTMLDetailsElement).open))await entry.locator("summary").click();await entry.getByRole("link",{name:`Учить слова: ${topic.title} →`,exact:true}).click();
    const dialog=page.getByRole("dialog",{name:"Учить слова",exact:true});await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading",{name:topic.title,level:1,exact:true})).toBeVisible();
    const expectedSets=wordBrowseSets(false).filter(set=>topicForWordSet(set)?.id===topic.id).map(set=>set.id).sort();
    const visibleSets=await dialog.locator("button[data-word-set-id]").evaluateAll(nodes=>nodes.map(node=>node.getAttribute("data-word-set-id"))).then(ids=>ids.sort());
    expect(expectedSets.length).toBeGreaterThan(0);expect(visibleSets).toEqual(expectedSets);
    await expect(dialog.locator("[data-collection-id]")).toHaveCount(0);
    await expect(page.locator('nav[aria-label="Разделы Tempo"] a[aria-current="page"]')).toHaveText("Учить слова");
    await expectNoOverflow(page);await page.goto("#/learning/topics");
  }
  const after=await exportBackup(page);expect(after.learning).toEqual(before.learning);expect(after.browser).toEqual(before.browser);
  await page.screenshot({path:info.outputPath("topic-catalogue.png")});
});
for(const scope of [
  {title:"Работа и учёба",id:"topic:work",setId:"library:collection:pairs-verbs-study-work:0",resume:"Работа и учёба"},
  {title:"Город и дорога",id:"topic:city",setId:"library:collection:scene-set-street:0",resume:"На нашей улице"},
  {title:"Знакомство и первые фразы",id:"foundation:hello",setId:"hello",resume:"Приветствия"},
  {title:"Одежда и цвета",id:"topic:vocabulary-clothing",setId:"colors-basic",resume:"Цвета"},
  {title:"Сотрудничество и общение",id:"topic:vocabulary-cooperation",setId:"library:collection:cooperation-rules:0",resume:"Общение и договорённости"},
  {title:"Буквы и чтение",id:"topic:reading",setId:"school:words:reading",resume:"Буквы и звуки"},
  {title:"Время и мой день",id:"topic:vocabulary-calendar",setId:"library:collection:calendar-week:0",resume:"Дни недели"},
  {title:"Моя семья и близкие",id:"topic:vocabulary-family",setId:"library:collection:expansion-family-close:0",resume:"Семья и родственники"},
  {title:"Еда и предпочтения",id:"topic:food",setId:"fruit",resume:"Фрукты и ягоды"},
])test(`${scope.title}: keeps the original set ID and resumes through reload and JSON`,async({page},info)=>{
  await importBackup(page,legacyBackup());const before=await exportBackup(page);
  await page.goto("#/learning/plan/words");await page.getByRole("link",{name:`${scope.title} →`,exact:true}).click();
  const dialog=page.getByRole("dialog",{name:"Учить слова",exact:true});await dialog.locator("button[data-tone]").first().click();
  await page.getByRole("button",{name:"Карточки слов",exact:true}).click();
  const front=await page.getByRole("button",{name:"Перевернуть карточку",exact:true}).locator("strong").innerText();
  await page.getByRole("button",{name:"Перевернуть карточку",exact:true}).click();
  await page.goto("#/learning/plan");
  const saved=await exportBackup(page);
  expect(saved.browser.learning.wordSession?.setId).toBe(scope.setId);
  expect(saved.learning).toEqual(before.learning);expect(saved.browser.cards).toEqual(before.browser.cards);
  await page.goto(`#/learning/quick-words?topic=${encodeURIComponent(scope.id)}`);await page.reload();await page.getByRole("button",{name:new RegExp(`^Продолжить · ${scope.resume}`)}).click();
  await expect(page.getByRole("button",{name:"Перевернуть карточку",exact:true}).locator("strong")).toHaveText(front);
  await page.goto("#/learning/plan");const resumed=await exportBackup(page);await importBackup(page,resumed);const restored=await exportBackup(page);
  expect(restored.learning).toEqual(saved.learning);expect(restored.browser.learning.wordSession).toEqual(resumed.browser.learning.wordSession);
  await expectNoOverflow(page);await page.screenshot({path:info.outputPath("topic-words.png")});
});
