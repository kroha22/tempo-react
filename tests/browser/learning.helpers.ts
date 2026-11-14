import {readFile} from "node:fs/promises";
import {expect,type Page} from "@playwright/test";
import type {ProfileBackup} from "../../github-pages/local-backup";

export const savedPath="#/learning/gramatica-ativa/saved";
export const wordsPath="#/learning/legacy-cards?group=intro";
export const reviewPath="#/learning/legacy-cards?group=intro&mode=review";
export const wordsRegion=(page:Page)=>page.getByRole("region",{name:"Слова прежних уроков: карточки и повторение",exact:true});

export async function createAdult(page:Page,name:string){
  await page.getByRole("textbox",{name:"Имя",exact:true}).fill(name);
  await page.getByRole("radio",{name:"Взрослый",exact:true}).check();
  await page.getByRole("button",{name:"Создать профиль и начать",exact:true}).click();
  await expect(page.getByRole("button",{name:"Сменить профиль или настройки",exact:true})).toHaveText(`${name} · Взрослый ▾`);
}
async function backupControls(page:Page){
  const controls=page.locator("details.local-backup");
  if(await controls.getAttribute("open")===null)await controls.locator("summary").click();
  return controls;
}
export async function exportBackup(page:Page):Promise<ProfileBackup>{
  const controls=await backupControls(page),downloaded=page.waitForEvent("download");
  await controls.getByRole("button",{name:"Скачать JSON",exact:true}).click();
  const download=await downloaded,path=await download.path();
  expect(await download.failure()).toBeNull();
  expect(download.suggestedFilename()).toMatch(/^tempo-.+\.json$/);
  return JSON.parse(await readFile(path!,"utf8")) as ProfileBackup;
}
export async function selectBackup(page:Page,contents:unknown){
  const controls=await backupControls(page);
  await controls.getByLabel("Открыть резервную копию",{exact:true}).setInputFiles({name:"synthetic-tempo.json",mimeType:"application/json",buffer:Buffer.from(typeof contents==="string"?contents:JSON.stringify(contents))});
  return controls;
}
export async function importBackup(page:Page,backup:ProfileBackup){
  const controls=await selectBackup(page,backup);
  await expect(controls.getByRole("region",{name:"Проверка резервной копии",exact:true})).toBeVisible();
  // Import reloads the document. Do not race it with the next hash navigation.
  await Promise.all([page.waitForEvent("load"),controls.getByRole("button",{name:"Объединить и восстановить",exact:true}).click()]);
  await expect(page.getByRole("button",{name:"Сменить профиль или настройки",exact:true})).toBeVisible();
}
export async function activateOlaFromLibrary(page:Page){
  await page.goto(savedPath);
  const card=page.locator("article").filter({has:page.getByText("Olá!",{exact:true})});
  await card.getByRole("button",{name:"Подключить повторение",exact:true}).click();
  await expect(card.getByRole("button",{name:"Повторение подключено ✓",exact:true})).toBeDisabled();
}
export async function rateOla(page:Page){
  await page.goto(reviewPath);
  await expect(page.getByRole("button",{name:"Показать ответ",exact:true})).toContainText("Olá!");
  await page.getByRole("button",{name:"Показать ответ",exact:true}).click();
  await page.getByRole("button",{name:/^Помню ·/}).click();
  await expect(page.getByRole("status").filter({hasText:"Оценка сохранена."})).toBeVisible();
  await expect(page.getByText(/Оценено за эту сессию: 1/)).toBeVisible();
}
export async function expectNoOverflow(page:Page){
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(()=>innerWidth));
}
