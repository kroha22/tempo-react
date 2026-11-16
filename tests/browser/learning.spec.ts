import {expect,test} from "@playwright/test";
import {browserNow,introduction,legacyBackup,legacyGroups,legacyIds,ola} from "./fixtures/legacy-profile";
import {activateOlaFromLibrary,createAdult,expectNoOverflow,exportBackup,importBackup,rateOla,reviewPath,savedPath,selectBackup,wordsPath,wordsRegion} from "./learning.helpers";

test.beforeEach(async({page})=>{
  await page.clock.setFixedTime(browserNow);
  await page.goto("./");
  await createAdult(page,"QA adult one");
});

test.afterEach(async({page})=>{
  expect((await page.pageErrors()).map(error=>error.message),"unhandled browser errors").toEqual([]);
  expect((await page.requests()).map(request=>request.url()).filter(url=>new URL(url).pathname.startsWith("/api/")),"Pages must use its local transport, not a network backend").toEqual([]);
});

test("lesson → word → Cards → SRS → reload keeps the lesson result, source and schedule",async({page},testInfo)=>{
  const lessonPath=`#/learning/lessons/${encodeURIComponent(introduction)}`;
  await page.goto(lessonPath);
  const lesson=page.getByRole("region",{name:"Представиться",exact:true});
  await lesson.getByRole("button",{name:"Chamo-me...",exact:true}).click();
  await lesson.getByRole("button",{name:"Проверить",exact:true}).click();
  await expect(lesson.getByRole("status").filter({hasText:/^Верно/})).toBeVisible();
  const completed=await exportBackup(page);
  expect(completed.browser.learning.activities?.[introduction]).toMatchObject({correct:1,total:1});
  const link=lesson.getByRole("link",{name:"Дополнительные карточки и подключение повторения →",exact:true});
  await link.focus();await page.keyboard.press("Enter");
  await expect(wordsRegion(page).getByRole("heading",{name:"Слова прежних уроков",exact:true})).toBeFocused();
  const word=wordsRegion(page).locator("article").filter({has:page.getByText("Olá!",{exact:true})});
  await word.getByRole("button",{name:"В карточки",exact:true}).click();
  await expect(word.getByRole("button",{name:"Повторение подключено ✓",exact:true})).toBeDisabled();
  await page.getByRole("link",{name:"Общий план",exact:true}).click();
  await page.getByRole("link",{name:"Слова и повторение",exact:true}).click();
  await page.getByRole("link",{name:"Мои карточки из уроков →",exact:true}).click();
  await expect(page.getByText("1 карточек",{exact:true})).toBeVisible();
  await expect(page.getByRole("button",{name:"Повторение подключено ✓",exact:true})).toBeDisabled();
  await page.getByRole("link",{name:"Слова прежних уроков · сохранить и подключить повторение →",exact:true}).click();
  await wordsRegion(page).getByRole("link",{name:"Повторение 17 целей",exact:true}).click();
  await expect(page.getByRole("button",{name:"Показать ответ",exact:true})).toContainText("Olá!");
  await page.getByRole("button",{name:"Показать ответ",exact:true}).click();
  await page.getByRole("button",{name:/^Помню ·/}).click();
  await expect(page.getByRole("status").filter({hasText:"Оценка сохранена."})).toBeVisible();
  const saved=await exportBackup(page),row=saved.learning.reviews[0];
  expect(saved.learning.items).toEqual([{studyItemId:ola,savedAt:browserNow}]);
  expect(saved.learning.sources).toEqual([{studyItemId:ola,sourceType:"lesson",sourceId:introduction}]);
  expect(row).toMatchObject({studyItemId:ola,reviewItemId:`saved:${ola}`,version:1,reviewedAt:browserNow,progress:{repetitions:1,lastGrade:2}});
  expect(row.progress!.due).toBeGreaterThan(browserNow);
  expect(saved.learning.reviewReceipts).toHaveLength(1);
  await page.reload();
  await expect(page.getByRole("heading",{name:"На сейчас всё",exact:true})).toBeVisible();
  const reloaded=await exportBackup(page);
  expect(reloaded.learning).toEqual(saved.learning);
  expect(reloaded.browser.learning.activities?.[introduction]).toEqual(completed.browser.learning.activities?.[introduction]);
  // Source/back link and keyboard return must still be reachable after reload.
  await wordsRegion(page).getByRole("link",{name:"Знакомство · 5",exact:true}).click();
  const explanation=wordsRegion(page).getByRole("link",{name:"Объяснение: Представиться →",exact:true});
  await explanation.focus();await page.keyboard.press("Enter");
  await expect(lesson).toBeVisible();
  await expectNoOverflow(page);
  await page.screenshot({path:testInfo.outputPath("lesson-word-srs.png")});
});

test("legacy JSON does not backfill; all 17 can activate without resetting existing data",async({page},testInfo)=>{
  const fixture=legacyBackup();await importBackup(page,fixture);
  // Both reads and the actual export must leave missing rows absent.
  await page.goto(savedPath);
  await expect(page.getByText("21 карточек",{exact:true})).toBeVisible();
  const imported=await exportBackup(page);
  expect(imported.learning).toEqual(fixture.learning);
  expect(imported.browser.cards).toEqual(fixture.browser.cards);
  await activateOlaFromLibrary(page);await rateOla(page);
  const rated=await exportBackup(page),olaRow=rated.learning.reviews.find(row=>row.studyItemId===ola)!;
  expect(olaRow.version).toBe(1);
  await page.goto(wordsPath);
  for(const group of legacyGroups){
    await wordsRegion(page).getByRole("link",{name:group.label,exact:true}).click();
    const buttons=wordsRegion(page).getByRole("button",{name:"Подключить повторение",exact:true});
    const expected=group.ids.filter(id=>id!==ola&&id!=="study:verb:estar:state").length;
    await expect(buttons).toHaveCount(expected);
    for(let i=0;i<expected;i++){
      await buttons.first().click();
      await expect(wordsRegion(page).getByRole("button",{name:"Повторение подключено ✓",exact:true})).toHaveCount(group.ids.length-expected+i+1);
    }
    await expectNoOverflow(page);
  }
  const after=await exportBackup(page);
  for(const key of ["items","sources","progress","events"] as const)expect(after.learning[key],key).toEqual(fixture.learning[key]);
  expect(after.browser.cards).toEqual(fixture.browser.cards);
  expect(after.learning.reviews).toHaveLength(18);
  expect(after.learning.reviewReceipts).toEqual(rated.learning.reviewReceipts);
  for(const old of fixture.learning.reviews)expect(after.learning.reviews.find(row=>row.studyItemId===old.studyItemId)).toEqual(old);
  expect(after.learning.reviews.find(row=>row.studyItemId===ola)).toEqual(olaRow);
  expect(after.learning.reviews.filter(row=>row.version===0)).toHaveLength(15);
  expect(after.learning.reviews.filter(row=>legacyIds.includes(row.studyItemId)).map(row=>row.studyItemId).sort()).toEqual([...legacyIds].sort());
  await page.reload();
  expect((await exportBackup(page)).learning).toEqual(after.learning);
  await page.goto(savedPath);
  await expect(page.getByRole("button",{name:"Повторение подключено ✓",exact:true})).toHaveCount(17);
  await expectNoOverflow(page);
  await page.screenshot({path:testInfo.outputPath("legacy-library.png")});
});

test("JSON round-trip, stale/invalid import and adult profile switches preserve independent saves",async({page},testInfo)=>{
  const fixture=legacyBackup();await importBackup(page,fixture);
  await activateOlaFromLibrary(page);await rateOla(page);
  const first=await exportBackup(page);
  await page.getByRole("button",{name:"Сменить профиль или настройки",exact:true}).click();
  await createAdult(page,"QA adult two");
  await page.goto(reviewPath);
  await expect(page.getByRole("heading",{name:"Пока нет сохранённых карточек",exact:true})).toBeVisible();
  const empty=await exportBackup(page);
  expect(empty.profile.id).not.toBe(first.profile.id);
  expect(empty.learning.items).toEqual([]);expect(empty.learning.reviews).toEqual([]);
  await importBackup(page,first);
  const copied=await exportBackup(page);
  expect(copied.profile).toEqual(empty.profile);
  expect(copied.learning).toEqual(first.learning);
  expect(copied.browser).toEqual(first.browser);
  // Import the same file twice, then an older one: never duplicate or regress a review.
  await importBackup(page,first);await importBackup(page,fixture);
  const merged=await exportBackup(page);
  expect(merged.learning).toEqual(first.learning);
  expect(merged.browser).toEqual(first.browser);
  const controls=await selectBackup(page,"{broken");
  await expect(controls.getByRole("status")).toContainText("Файл повреждён");
  await expect(controls.getByRole("button",{name:"Объединить и восстановить",exact:true})).toHaveCount(0);
  expect((await exportBackup(page)).learning).toEqual(first.learning);
  // Write only in the second profile and prove that the first does not inherit it.
  await page.goto(wordsPath);
  const other=wordsRegion(page).locator("article").filter({has:page.getByText("Muito prazer.",{exact:true})});
  await other.getByRole("button",{name:"Подключить повторение",exact:true}).click();
  await expect(other.getByRole("button",{name:"Повторение подключено ✓",exact:true})).toBeDisabled();
  const second=await exportBackup(page);expect(second.learning.reviews).toHaveLength(4);
  await page.getByRole("button",{name:"Сменить профиль или настройки",exact:true}).click();
  await page.getByRole("button",{name:"Продолжить — QA adult one",exact:true}).click();
  expect((await exportBackup(page)).learning).toEqual(first.learning);
  await page.reload();expect((await exportBackup(page)).learning).toEqual(first.learning);
  await page.getByRole("button",{name:"Сменить профиль или настройки",exact:true}).click();
  await page.getByRole("button",{name:"Продолжить — QA adult two",exact:true}).click();
  expect((await exportBackup(page)).learning).toEqual(second.learning);
  await page.goto(wordsPath);await expectNoOverflow(page);
  await page.screenshot({path:testInfo.outputPath("profile-round-trip.png")});
});
