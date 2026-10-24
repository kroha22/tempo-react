import {expect,it,vi} from "vitest";
import {render} from "@testing-library/react";
import {publicAssetUrl} from "@/shared/public-asset";
import {VocabularyIllustration} from "@/features/practice/VocabularyIllustration";

it("keeps main-app and external image URLs intact",()=>{
  expect(publicAssetUrl("/images/portrait.png")).toBe("/images/portrait.png");
  expect(publicAssetUrl("https://example.com/portrait.png")).toBe("https://example.com/portrait.png");
});
it("resolves atlas backgrounds below the static demo's deployment path",()=>{
  vi.stubGlobal("__TEMPO_ASSET_BASE__","/tempo-react/");
  const {container}=render(<VocabularyIllustration illustration={{src:"/images/portrait.png",grid:3,column:0,row:0}}/>);
  expect(container.firstChild).toHaveStyle({backgroundImage:'url("/tempo-react/images/portrait.png")'});
});
it("uses the same deployment path for cropped SVG atlases without changing the crop",()=>{
  vi.stubGlobal("__TEMPO_ASSET_BASE__","/tempo-react/");
  const {container}=render(<VocabularyIllustration illustration={{src:"/images/portrait.png",row:0,column:0,crop:{x:0,y:10,width:100,height:120,sourceWidth:300,sourceHeight:300}}}/>);
  expect(container.querySelector("image")).toHaveAttribute("href","/tempo-react/images/portrait.png");
  expect(container.querySelector("svg")).toHaveAttribute("viewBox","0 10 100 120");
});
