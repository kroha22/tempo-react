import {preparationKeywords} from "./preparation-support";
import {catalogWords} from "./learning-catalog-view";

// Compatibility resolver shared by the existing view and the migration inventory.
// Keep label + meaning matching, keyword order and fallback IDs unchanged.
export function preparationWords(unitId:string){
  return (preparationKeywords[unitId]??[]).map(([label,translation],i)=>{
    const existing=catalogWords.find(word=>word.label===label&&word.translation.toLocaleLowerCase("ru").replace(/[.!]$/u,"")===translation.toLocaleLowerCase("ru"));
    return existing??{id:`prep-keyword:${unitId}:${i}`,label,translation};
  });
}
