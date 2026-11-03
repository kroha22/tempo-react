import {render,screen} from "@testing-library/react";
import {it,expect,vi} from "vitest";
import {SerEstarExplanation} from "@/features/practice/SerEstarExplanation";
import {ImageMatchingExercise} from "@/features/practice/ImageMatchingExercise";
import {publicAssetUrl} from "@/shared/public-asset";

it.each([false,true])("SER/ESTAR images respect the Pages prefix (child=%s)",childMode=>{
  vi.stubGlobal("__TEMPO_ASSET_BASE__","/tempo-react/");
  render(<SerEstarExplanation childMode={childMode}/>);
  expect(screen.getByRole("img",{name:"Люди, роли и происхождение"})).toHaveAttribute("src",`/tempo-react/ser-guide-${childMode?"kingdoms":"adult"}.webp`);
  expect(screen.getByRole("img",{name:"Состояние, положение и изменения"})).toHaveAttribute("src",`/tempo-react/estar-guide-${childMode?"kingdoms":"adult"}.webp`);
});
it("image placement scenes respect the prefix without changing crop geometry",()=>{
  vi.stubGlobal("__TEMPO_ASSET_BASE__","/tempo-react/");
  render(<ImageMatchingExercise words={[{id:"chair",label:"a cadeira",translation:"Стул"}]} definition={{id:"asset-test",title:"Дом",image:{src:"/house-illustration-v3.webp",alt:"Дом",width:600,height:400,crop:{x:60,y:40,width:300,height:200}},wordIds:["chair"],spots:[{id:"chair",x:30,y:50,acceptedWordIds:["chair"]}]}}/>);
  const image=screen.getByRole("img",{name:"Дом"});
  expect(image).toHaveAttribute("src","/tempo-react/house-illustration-v3.webp");
  expect(image).toHaveStyle({width:"200%",left:"-20%",top:"-20%"});
});
it("root deployment and external resources retain their original URLs",()=>{
  expect(publicAssetUrl("/ser-guide-adult.webp")).toBe("/ser-guide-adult.webp");
  vi.stubGlobal("__TEMPO_ASSET_BASE__","/tempo-react/");
  expect(publicAssetUrl("/tempo-react/images/scenes/street.webp")).toBe("/tempo-react/images/scenes/street.webp");
  expect(publicAssetUrl("https://example.com/image.webp")).toBe("https://example.com/image.webp");
  expect(publicAssetUrl("data:image/svg+xml,svg")).toBe("data:image/svg+xml,svg");
});
