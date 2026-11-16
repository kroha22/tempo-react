import {catalogWords} from "./learning-catalog-view";
import type {VocabularyWord} from "./vocabulary-model";
import {spatialArt} from "./spatial-art";
type Art=NonNullable<VocabularyWord["illustration"]>;
const single=(src:string):Art=>({src,column:0,row:0});
const book=single(spatialArt.book);
const word=(label:string):Art=>catalogWords.find(word=>word.label===label&&word.illustration)?.illustration??book;
const clock:Art={src:"/images/vocabulary/my-day-cover.svg",row:0,column:0,crop:{x:235,y:25,width:240,height:250,sourceWidth:600,sourceHeight:300}};
const byId:Record<string,Art>={
  "topic:vocabulary-calendar":clock,
  "topic:food":word("a maçã"),
  "topic:vocabulary-house":single("/house-illustration-v3.webp"),
  "topic:vocabulary-body":word("a mão"),
  "topic:reading":book,
  "topic:vocabulary-cooperation":single("/images/covers/cooperation-v2.webp"),
};
const byTitle:Record<string,Art>={
  "Время и календарь":clock,"Еда и предпочтения":word("a maçã"),
  "Дом и расположение":byId["topic:vocabulary-house"],"Тело и здоровье":word("a mão"),
  "Школа, друзья и игры":single(spatialArt.bag),"Общение на каждый день":single("/images/learning-covers/greetings-v1.png"),
  "Глаголы и действия":single("/images/covers/verbs-v1.webp"),"Цвета и одежда":word("a camisola"),
  "Мир вокруг нас":word("a vaca"),"Другие подборки":book,
};
export const wordCollectionArt=(id:string,title:string):Art=>byId[id]??byTitle[title]??book;
