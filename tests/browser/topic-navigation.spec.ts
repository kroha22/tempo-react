import {expect,test} from "@playwright/test";
import {browserNow,legacyBackup} from "./fixtures/legacy-profile";
import {createAdult,exportBackup,importBackup,expectNoOverflow} from "./learning.helpers";
const topics=[
  {id:"topic:reading",title:"Буквы и чтение",href:"/learning/reading"},
  {id:"topic:vocabulary-family",title:"Моя семья и близкие",href:"/learning/family?topic=close&phase=explanation"},
  {id:"topic:food",title:"Еда и предпочтения",href:"/learning/food?topic=fruit&phase=explanation"},
  {id:"topic:vocabulary-calendar",title:"Время и мой день",href:"/learning/time-day?topic=hours&phase=explanation"},
  {id:"topic:vocabulary-body",title:"Тело и здоровье",href:"/learning/body?topic=face&phase=explanation"},
  {id:"topic:vocabulary-house",title:"Дом и расположение",href:"/learning/home?topic=rooms&phase=explanation"},
];
test.beforeEach(async({page})=>{await page.clock.setFixedTime(browserNow);await page.goto("./");await createAdult(page,"Topic QA");});
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
test("plan, catalogue and word sections share six entries without changing old saves",async({page},info)=>{
  await importBackup(page,legacyBackup());const before=await exportBackup(page);
  await page.goto("#/learning/plan");const everyday=page.locator("summary").filter({hasText:"Повседневные темы"}).locator("..");await everyday.locator("summary").first().click();
  for(const topic of topics){
    if(topic.id==="topic:reading"){
      const school=page.locator("summary").filter({hasText:"Буквы и школьные темы"}).locator("..");await school.locator("summary").first().click();
      await school.locator("summary").filter({hasText:topic.title}).click();
      await expect(school.locator(`a[href="#${topic.href}"]`)).toBeVisible();continue;
    }
    await everyday.locator("summary").filter({hasText:topic.title}).click();
    await expect(everyday.locator(`a[href="#${topic.href}"]`)).toBeVisible();
  }
  await page.goto("#/learning/topics");
  for(const topic of topics){
    const entry=page.getByRole("region",{name:`Тема: ${topic.title}`,exact:true});await expect(entry).toHaveCount(1);
    await expect(entry.locator(`a[href="#${topic.href}"]`)).toBeVisible();
    if(!await entry.locator("details").evaluate(node=>(node as HTMLDetailsElement).open))await entry.locator("summary").click();await entry.getByRole("link",{name:`Учить слова: ${topic.title} →`,exact:true}).click();
    const dialog=page.getByRole("dialog",{name:"Учить слова",exact:true});await expect(dialog).toBeVisible();
    await expect(dialog.locator("summary").filter({hasText:topic.title})).toBeVisible();
    expect(await dialog.locator("summary").count()).toBe(1);
    await expect(page.locator('nav[aria-label="Разделы Tempo"] a[aria-current="page"]')).toHaveText("Учить слова");
    await expectNoOverflow(page);await page.goto("#/learning/topics");
  }
  const after=await exportBackup(page);expect(after.learning).toEqual(before.learning);expect(after.browser).toEqual(before.browser);
  await page.screenshot({path:info.outputPath("topic-catalogue.png")});
});
for(const scope of [
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
