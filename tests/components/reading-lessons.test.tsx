import {useState} from "react";
import {fireEvent,render,screen,within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {expect,it,vi} from "vitest";
import {VocabularyHub} from "@/features/practice/VocabularyHub";
import {ProfileLearningContext,emptyProfileLearning,type ProfileLearning} from "@/features/practice/profile-learning";
import {preparationPhonics} from "@/features/content/preparation-phonics";
import {createProfile,profileStores} from "@/github-pages/profiles";
import {preparationUnits} from "@/features/content/test-preparation";
import {TestPreparation} from "@/features/practice/TestPreparation";

it("opens all ten language lessons and keeps the full preparation available",()=>{
  render(<VocabularyHub onOpenCards={vi.fn()}/>);
  fireEvent.click(screen.getByRole("button",{name:/Буквы и чтение/}));
  expect(screen.getByText("10 тем · 10 всего")).toBeVisible();
  expect(screen.queryByRole("navigation",{name:"Предмет подготовки"})).not.toBeInTheDocument();
  for(const {title:[title]} of preparationUnits.filter(unit=>unit.subject==="portuguese")){
    fireEvent.click(screen.getByRole("button",{name:new RegExp(title.replace(/[?]/g,"\\?"))}));
    expect(screen.getByRole("heading",{level:2,name:title})).toBeVisible();
    expect(screen.queryByText(/на памятке/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"← К буквам и чтению"}));
  }
  fireEvent.click(screen.getByRole("button",{name:"← Ко всем темам"}));
  expect(screen.getByRole("button",{name:/Подготовка к тесту/})).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:/Подготовка к тесту/}));
  expect(screen.getByText("6 тем · 20 всего")).toBeVisible();
});

it.each(["c-cedilla","s-z","g-gu","nasal","digraphs","x-sounds","clusters"])("keeps %s answers and existing progress after remount and a worse retry",id=>{
  localStorage.clear();
  const profile=createProfile("F02",false,false),stores=profileStores(profile.id);
  const old={title:"Алфавит",group:"Слова в жизни",correct:1,total:1} as const;
  stores.learning.save({...stores.learning.load(),activities:{"prep:phonics:letters:vowels":old}});
  function Session({reading=true}:{reading?:boolean}){
    const [learning,setLearning]=useState(()=>stores.learning.load());
    return <ProfileLearningContext value={{profile,learning,savingError:false,update:change=>{const next=change(stores.learning.load());stores.learning.save(next);setLearning(next);return true;}}}><TestPreparation reading={reading} initialUnitId={id} onUnitChange={()=>{}} onBack={()=>{}} onOpen={()=>{}}/></ProfileLearningContext>;
  }
  const words=preparationPhonics[id],view=render(<Session/>);
  fireEvent.click(screen.getByRole("button",{name:"Praticar"}));
  for(const word of words)fireEvent.click(screen.getByRole("button",{name:`${word.meaning}: ${word.group}`}));
  fireEvent.click(screen.getByRole("button",{name:"Verificar"}));
  expect(stores.learning.load().activities?.[`prep:phonics:${id}`]).toMatchObject({correct:words.length,total:words.length});
  view.unmount();render(<Session reading={false}/>);
  fireEvent.click(screen.getByRole("button",{name:"Praticar"}));
  for(const word of words){const wrong=words.find(other=>other.group!==word.group)!.group;fireEvent.click(screen.getByRole("button",{name:`${word.meaning}: ${wrong}`}));}
  fireEvent.click(screen.getByRole("button",{name:"Verificar"}));
  const results=stores.learning.load().activities!;
  expect(results[`prep:phonics:${id}`]).toMatchObject({correct:words.length,total:words.length});
  expect(results["prep:phonics:letters:vowels"]).toEqual(old);
  expect(Object.keys(results).sort()).toEqual(["prep:phonics:letters:vowels",`prep:phonics:${id}`].sort());
});

it.each([false,true])("shares spelling results with preparation (previous best: %s)",async(previousBest)=>{
  const user=userEvent.setup();
  function Session(){
    const [learning,setLearning]=useState<ProfileLearning>({...emptyProfileLearning(),activities:previousBest?{"prep:phonics:r-rr":{title:"R/RR",group:"Слова в жизни",correct:12,total:12}}:{}});
    return <ProfileLearningContext value={{profile:{id:"reading-test",child:false},learning,savingError:false,update:change=>{setLearning(change);return true;}}}><VocabularyHub onOpenCards={vi.fn()}/><output aria-label="Saved results">{JSON.stringify(learning.activities)}</output></ProfileLearningContext>;
  }
  render(<Session/>);
  await user.click(screen.getByRole("button",{name:/Буквы и чтение/}));
  await user.click(screen.getByRole("button",{name:/R ou RR/}));
  await user.click(screen.getByRole("button",{name:"Praticar"}));
  const words=preparationPhonics["r-rr"];
  for(let offset=0;offset<12;offset+=4){
    for(const [i,word] of words.slice(offset,offset+4).entries())fireEvent.click(screen.getByRole("button",{name:`${word.meaning}: ${offset===0&&i===0?"rr":word.group}`}));
    fireEvent.click(screen.getByRole("button",{name:"Verificar"}));
    fireEvent.click(screen.getByRole("button",{name:offset===8?"Concluir":"Seguinte →"}));
  }
  expect(screen.getByText("11 / 12")).toBeVisible();
  expect(JSON.parse(screen.getByLabelText("Saved results").textContent!)["prep:phonics:r-rr"].correct).toBe(previousBest?12:11);
  await user.click(screen.getByRole("button",{name:"← К буквам и чтению"}));
  await user.click(screen.getByRole("button",{name:"← Ко всем темам"}));
  await user.click(screen.getByRole("button",{name:/Подготовка к тесту/}));
  await user.click(within(screen.getByRole("navigation",{name:"Предмет подготовки"})).getByRole("button",{name:"Português"}));
  await user.click(screen.getByRole("button",{name:/R ou RR/}));
  await user.click(screen.getByRole("button",{name:"Praticar"}));
  expect(screen.getByText("Ronda 1 / 3 · 4 palavras")).toBeVisible();
  expect(Object.keys(JSON.parse(screen.getByLabelText("Saved results").textContent!))).toEqual(["prep:phonics:r-rr"]);
});

it.each(["letters","s-ss"])("persists %s under the original activity key and keeps another profile unchanged",async(id)=>{
  localStorage.clear();
  const profile=createProfile("Чтение QA",false,false),other=createProfile("Другой профиль",false,false);
  const stores=profileStores(profile.id),otherBefore=profileStores(other.id).learning.load();
  function Session(){
    const [learning,setLearning]=useState(()=>stores.learning.load());
    return <ProfileLearningContext value={{profile,learning,savingError:false,update:change=>{const next=change(stores.learning.load());stores.learning.save(next);setLearning(next);return true;}}}><VocabularyHub onOpenCards={vi.fn()}/></ProfileLearningContext>;
  }
  const user=userEvent.setup(),view=render(<Session/>);
  await user.click(screen.getByRole("button",{name:/Буквы и чтение/}));
  await user.click(screen.getByRole("button",{name:id==="letters"?/O alfabeto/:/S ou SS/}));
  await user.click(screen.getByRole("button",{name:"Praticar"}));
  if(id==="letters"){
    for(const letter of "AEIOU")await user.click(screen.getByRole("button",{name:`${letter} ${letter.toLowerCase()}`}));
    await user.click(screen.getByRole("button",{name:"Verificar"}));
  }else{
    for(let offset=0;offset<8;offset+=4){
      for(const word of preparationPhonics[id].slice(offset,offset+4))await user.click(screen.getByRole("button",{name:`${word.meaning}: ${word.group}`}));
      await user.click(screen.getByRole("button",{name:"Verificar"}));
      await user.click(screen.getByRole("button",{name:offset===4?"Concluir":"Seguinte →"}));
    }
  }
  const key=id==="letters"?"prep:phonics:letters:vowels":"prep:phonics:s-ss";
  const saved=stores.learning.load();
  expect(saved.activities?.[key]).toMatchObject({correct:id==="letters"?1:8,total:id==="letters"?1:8});
  view.unmount();render(<Session/>);
  expect(stores.learning.load()).toEqual(saved);
  expect(profileStores(other.id).learning.load()).toEqual(otherBefore);
  expect(Object.keys(saved.activities??{})).toEqual([key]);
});
