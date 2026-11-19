import {adultMaterialKey,adultMaterialsForBlock,adultRouteBlocks,adultSharedMaterials,adultLegacyCatalogPlacements} from "./adult-route.ts";
import {adultMaterialSources,type AdultMaterialSource} from "./adult-route-catalog.ts";
import {catalogGroups} from "./learning-catalog-view.ts";

export const catalogText=(text:string)=>text.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase().trim();
export type AdultCatalogEntry={material:AdultMaterialSource;references:readonly string[];searchText:string};
export function adultCatalogShared(sources:readonly AdultMaterialSource[]=adultMaterialSources()){
  const byKey=new Map(sources.map(source=>[adultMaterialKey(source),source]));
  return adultSharedMaterials().flatMap(ref=>{const source=byKey.get(adultMaterialKey(ref));return source?[source]:[];});
}
export function adultCatalogLegacy(query=""){
  const search=catalogText(query);
  return catalogGroups.filter(group=>Object.hasOwn(adultLegacyCatalogPlacements,group.id)&&(!search||catalogText(`${group.title} ${group.id}`).includes(search))).map(group=>({group,block:adultLegacyCatalogPlacements[group.id]}));
}
/** A search projection of the route, not another curriculum or completion owner. */
export function adultCatalogGroups(query="",sources:readonly AdultMaterialSource[]=adultMaterialSources()){
  const byKey=new Map(sources.map(source=>[adultMaterialKey(source),source]));
  const search=catalogText(query);
  return adultRouteBlocks.map(block=>{
    const candidates=adultMaterialsForBlock(block.key).map(ref=>byKey.get(adultMaterialKey(ref))).filter((source):source is AdultMaterialSource=>!!source&&(!source.legacyOnly||!!search&&catalogText(`${source.title} ${source.sourceId}`).includes(search)));
    // Keep thematic entry/legacy buttons when it shares a URL with a short unit.
    const ordered=[...candidates.filter(source=>source.kind==="topic"),...candidates.filter(source=>source.kind!=="topic")];
    const entries:AdultCatalogEntry[]=[],byDestination=new Map<string,AdultCatalogEntry>();
    for(const material of ordered){
      const key=adultMaterialKey(material),destination=material.href??material.wordsHref??key;
      const searchText=`${material.title} ${key} ${(material.aliases??[]).join(" ")}`;
      const old=byDestination.get(destination);
      if(old){old.references=[...old.references,key];old.searchText+=` ${searchText}`;continue;}
      const entry={material,references:[key],searchText};entries.push(entry);byDestination.set(destination,entry);
    }
    const blockMatches=!!search&&catalogText(`${block.title} ${block.goal}`).includes(search);
    return {block,legacy:adultCatalogLegacy(blockMatches?"":query).filter(entry=>entry.block===block.key),entries:entries.filter(entry=>!search||blockMatches||catalogText(entry.searchText).includes(search))};
  }).filter(group=>!search||group.entries.length>0||group.legacy.length>0);
}
