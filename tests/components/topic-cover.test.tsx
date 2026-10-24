import {render} from "@testing-library/react";
import {expect,it} from "vitest";
import {TopicCover} from "@/features/practice/TopicCover";

it("uses a dedicated lesson cover instead of an exercise word illustration",()=>{
  const group={id:"topic:vocabulary-lessons",title:"Из уроков",subgroups:[{id:"items",title:"Предметы",sets:[{id:"set",title:"Предметы",words:["cat","book"]}]}]};
  const words=[{id:"cat",label:"o gato",translation:"Кот",illustration:{src:"/cat.webp",row:0,column:0}},{id:"book",label:"o livro",translation:"Книга",illustration:{src:"/book.webp",row:0,column:0}}];
  const {container}=render(<TopicCover group={group} words={words} images={[]}/>);
  expect(container.querySelector('img')?.getAttribute('src')).toBe('/images/covers/aunt-reading-v1.webp');
  expect(container.querySelector('[style*="book.webp"]')).toBeNull();
  expect(container.querySelector('[style*="cat.webp"]')).toBeNull();
});
