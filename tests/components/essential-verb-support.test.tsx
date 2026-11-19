import {expect,it} from "vitest";
import {render,screen,fireEvent,cleanup} from "@testing-library/react";
import {wordLibraryFor} from "@/features/content/word-learning-library";
import {quickVerbSupport} from "@/features/content/quick-word-expansion";
import {verbs} from "@/features/conjugation/data";
import {QuickVerbDetails} from "@/features/practice/QuickVerbDetails";

const ids=["v0001","v0003","v0002","v0006","v0016","v0005","v0004","v0012","v0011","general-vocabulary:verb:dizer","study:ga1:verb:dar:entry","study:ga1:verb:ver:entry","v0083","v0042","study:ga1:verb:por:entry","v0067","v0029","v0050","v0158","v0034"];
it.each([false,true])("supports all twenty existing verb IDs with complete shared present tables (%s)",child=>{
  const pack=wordLibraryFor(child).find(set=>set.id==="basic-irregular")!;
  expect(pack.words.map(word=>word.id)).toEqual(ids);
  for(const word of pack.words){
    const support=quickVerbSupport[word.id];
    expect(support.forms.map(row=>row.label)).toEqual(["eu","tu","ele / ela","nós","vocês","eles / elas"]);
    expect(support.forms.every(row=>!!row.value&&!row.value.includes(" · "))).toBe(true);
    expect(support.example.pt.toLocaleLowerCase("pt-PT")).toContain(support.firstPerson);
    expect(support.example.ru).toBeTruthy();
    const canonical=verbs[word.label as keyof typeof verbs];
    if(canonical)expect(support.forms.map(row=>row.value)).toEqual(Object.values(canonical.forms.present));
  }
});

it("keeps easily confused European Portuguese present forms distinct",()=>{
  const words=wordLibraryFor(false).find(set=>set.id==="basic-irregular")!.words;
  const forms=(lemma:string)=>quickVerbSupport[words.find(word=>word.label===lemma)!.id].forms.map(row=>row.value);
  expect(forms("vir")).toEqual(["venho","vens","vem","vimos","vêm","vêm"]);
  expect(forms("ver")).toEqual(["vejo","vês","vê","vemos","veem","veem"]);
  expect(forms("ler")).toEqual(["leio","lês","lê","lemos","leem","leem"]);
  expect(forms("pôr")).toEqual(["ponho","pões","põe","pomos","põem","põem"]);
  expect(forms("sair")[3]).toBe("saímos");
  expect(forms("ouvir")[0]).toBe("ouço");
});

it("renders the example, pronunciation controls and expandable six-person table for every verb",()=>{
  for(const word of wordLibraryFor(false).find(set=>set.id==="basic-irregular")!.words){
    const support=quickVerbSupport[word.id];
    render(<QuickVerbDetails wordId={word.id} active={false}/>);
    expect(screen.getByLabelText("Формы и пример глагола")).toBeVisible();
    expect(screen.getByText(support.example.pt)).toBeVisible();
    expect(screen.getByText(support.example.ru)).toBeVisible();
    fireEvent.click(screen.getByText("Формы · Presente"));
    expect(screen.getByText("nós")).toBeVisible();
    expect(screen.getAllByRole("button")).toHaveLength(2);
    cleanup();
  }
});
