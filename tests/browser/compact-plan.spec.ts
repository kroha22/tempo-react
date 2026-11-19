import {expect,test} from "@playwright/test";
import {browserNow,legacyBackup} from "./fixtures/legacy-profile";
import {createAdult,exportBackup,importBackup,expectNoOverflow} from "./learning.helpers";

test.beforeEach(async({page})=>{await page.clock.setFixedTime(browserNow);await page.goto("./");await createAdult(page,"Compact adult");});
test("compact plan puts the next action in the first viewport and opens book materials by keyboard",async({page},info)=>{
  const plan=page.getByRole("region",{name:"Общий план обучения",exact:true});
  const start=plan.getByRole("link",{name:"Начать занятие →",exact:true});await expect(start).toBeVisible();
  const rect=await start.boundingBox();expect(rect!.y+rect!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  expect(await plan.locator("details[open]").count()).toBe(0);
  await expect(plan.getByRole("link",{name:"Слова и повторение",exact:true})).toBeVisible();
  await page.screenshot({path:info.outputPath("compact-home.png")});
  const course=plan.locator('details[data-route-block="B01"] > summary');await course.focus();await page.keyboard.press("Enter");
  await expect(plan.locator('[data-material-key="book/U01"]').getByRole("link",{name:"Объяснение →",exact:true})).toBeVisible();
  await expectNoOverflow(page);await page.screenshot({path:info.outputPath("compact-course.png")});
});
test("permanent school lessons and word cards preserve old saved data through switches and reload",async({page},info)=>{
  const fixture=legacyBackup();await importBackup(page,fixture);
  const before=await exportBackup(page);
  await page.goto("#/learning/plan/school?unit=r-rr");
  await expect(page.getByRole("button",{name:"Praticar",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Учить слова",exact:true}).click();
  await expect(page.getByRole("button",{name:"Перевернуть карточку",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Перевернуть карточку",exact:true}).click();
  await page.getByRole("button",{name:"Урок",exact:true}).click();
  await expect(page.getByRole("button",{name:"Praticar",exact:true})).toBeVisible();
  await page.goto("#/learning/plan/words");
  await expect(page.getByRole("link",{name:"Повторить сохранённые →",exact:true})).toBeVisible();
  await page.locator("summary").filter({hasText:"Слова из школьных уроков"}).click();
  await page.locator("summary").filter({hasText:"Тело и здоровье"}).click();
  const words=page.locator('a[href="#/learning/plan/school?unit=wellbeing&words=1"]');await words.click();
  await expect(page.getByRole("button",{name:"Перевернуть карточку",exact:true})).toBeVisible();
  await page.reload();await expect(page.getByRole("button",{name:"Перевернуть карточку",exact:true})).toBeVisible();
  const after=await exportBackup(page);expect(after.learning).toEqual(before.learning);expect(after.browser.cards).toEqual(before.browser.cards);
  await expectNoOverflow(page);await page.screenshot({path:info.outputPath("school-words.png")});
});
