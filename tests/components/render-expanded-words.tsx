import {render,fireEvent} from "@testing-library/react";
/** Existing activity scenarios start after the learner opens their collections. */
export function renderExpandedWords(ui:Parameters<typeof render>[0]){
  const view=render(ui);
  for(const details of view.container.querySelectorAll<HTMLDetailsElement>('dialog[aria-label="Учить слова"] details')){
    const summary=details.querySelector("summary");if(summary&&!details.open)fireEvent.click(summary);
  }
  return view;
}
