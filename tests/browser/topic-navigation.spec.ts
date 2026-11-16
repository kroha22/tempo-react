import {expect,test} from "@playwright/test";
import {browserNow,legacyBackup} from "./fixtures/legacy-profile";
import {createAdult,exportBackup,importBackup,expectNoOverflow} from "./learning.helpers";
const topics=[
  {id:"topic:vocabulary-calendar",title:"Время и мой день",href:"/learning/time-day?topic=hours&phase=explanation"},
  {id:"topic:vocabulary-body",title:"Тело и здоровье",href:"/learning/body?topic=face&phase=explanation"},
  {id:"topic:vocabulary-house",title:"Дом и расположение",href:"/learning/home?topic=rooms&phase=explanation"},
];
test.beforeEach(async({page})=>{await page.clock.setFixedTime(browserNow);await page.goto("./");await createAdult(page,"Topic QA");});
test("plan, catalogue and word sections share three entries without changing old saves",async({page},info)=>{
  await importBackup(page,legacyBackup());const before=await exportBackup(page);
  await page.goto("#/learning/plan");const everyday=page.locator("summary").filter({hasText:"Повседневные темы"}).locator("..");await everyday.locator("summary").first().click();
  for(const topic of topics){
    await everyday.locator("summary").filter({hasText:topic.title}).click();
    await expect(everyday.locator(`a[href="#${topic.href}"]`)).toBeVisible();
  }
  await page.goto("#/learning/topics");
  for(const topic of topics){
    const entry=page.getByRole("region",{name:`Тема: ${topic.title}`,exact:true});await expect(entry).toHaveCount(1);
    await expect(entry.locator(`a[href="#${topic.href}"]`)).toBeVisible();
    await entry.locator("summary").click();await entry.getByRole("link",{name:`Учить слова: ${topic.title} →`,exact:true}).click();
    const dialog=page.getByRole("dialog",{name:"Учить слова",exact:true});await expect(dialog).toBeVisible();
    await expect(dialog.locator("summary").filter({hasText:topic.title})).toBeVisible();
    expect(await dialog.locator("summary").count()).toBe(1);
    await expect(page.locator('nav[aria-label="Разделы Tempo"] a[aria-current="page"]')).toHaveText("Учить слова");
    await expectNoOverflow(page);await page.goto("#/learning/topics");
  }
  const after=await exportBackup(page);expect(after.learning).toEqual(before.learning);expect(after.browser).toEqual(before.browser);
  await page.screenshot({path:info.outputPath("topic-catalogue.png")});
});
test("topic word selection keeps the original set ID and resumes through reload and JSON",async({page},info)=>{
  await importBackup(page,legacyBackup());const before=await exportBackup(page);
  await page.goto("#/learning/plan/words");await page.getByRole("link",{name:"Время и мой день →",exact:true}).click();
  const dialog=page.getByRole("dialog",{name:"Учить слова",exact:true});await dialog.locator("button[data-tone]").first().click();
  await page.getByRole("button",{name:"Карточки слов",exact:true}).click();
  const front=await page.getByRole("button",{name:"Перевернуть карточку",exact:true}).locator("strong").innerText();
  await page.getByRole("button",{name:"Перевернуть карточку",exact:true}).click();
  await page.goto("#/learning/plan");
  const saved=await exportBackup(page);
  expect(saved.browser.learning.wordSession?.setId).toBe("library:collection:calendar-week:0");
  expect(saved.learning).toEqual(before.learning);expect(saved.browser.cards).toEqual(before.browser.cards);
  await page.goto("#/learning/quick-words?topic=topic%3Avocabulary-calendar");await page.reload();await page.getByRole("button",{name:/^Продолжить · Дни недели/}).click();
  await expect(page.getByRole("button",{name:"Перевернуть карточку",exact:true}).locator("strong")).toHaveText(front);
  await page.goto("#/learning/plan");const resumed=await exportBackup(page);await importBackup(page,resumed);const restored=await exportBackup(page);
  expect(restored.learning).toEqual(saved.learning);expect(restored.browser.learning.wordSession).toEqual(resumed.browser.learning.wordSession);
  await expectNoOverflow(page);await page.screenshot({path:info.outputPath("topic-words.png")});
});
