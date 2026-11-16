import {render,screen} from "@testing-library/react";
import type userEvent from "@testing-library/user-event";
import {wordBrowseSets} from "@/features/content/word-browse-sets";
import {wordCollections} from "@/features/content/word-collections";
export function renderExpandedWords(ui:Parameters<typeof render>[0]){
  return render(ui);
}
/** Enter the visible collection before starting an existing activity scenario. */
export async function openWordSet(user:ReturnType<typeof userEvent.setup>,name:string|RegExp){
  const dialog=screen.getByRole("dialog",{name:"Учить слова"}),child=dialog.getAttribute("data-child")==="true";
  const sets=wordBrowseSets(child),set=sets.find(set=>typeof name==="string"?`${set.pt} ${set.title} ${set.words.length} карточек`===name:name.test(`${set.pt} ${set.title} ${set.words.length} карточек`));
  if(!set)throw new Error(`Unknown test set ${name}`);
  const find=()=>[...dialog.querySelectorAll<HTMLButtonElement>("[data-word-set-id]")].find(button=>button.dataset.wordSetId===set.id);
  if(!find()){
    const back=screen.queryByRole("button",{name:"Все сборники"});if(back)await user.click(back);
    const group=wordCollections(sets,child).find(group=>group.sets.some(item=>item.id===set.id))!;
    const button=[...dialog.querySelectorAll<HTMLButtonElement>("[data-collection-id]")].find(button=>button.dataset.collectionId===group.id);
    if(button)await user.click(button);
  }
  const target=find();if(!target)throw new Error(`Missing test set ${set.id}`);await user.click(target);
}
