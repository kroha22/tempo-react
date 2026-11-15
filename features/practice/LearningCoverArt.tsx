import {learningCoverArt} from "../content/learning-cover-art";
import {publicAssetUrl} from "../../shared/public-asset";
import {lessonCovers} from "./lesson-covers";
export function learningCoverSource(id:string,aliases:readonly string[]=[]){return learningCoverArt[id]??aliases.map(alias=>lessonCovers[alias]).find(Boolean);}
export function LearningCoverArt({id,aliases=[]}:{id:string;aliases?:readonly string[]}){
  const src=learningCoverSource(id,aliases);if(!src)return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={publicAssetUrl(src)} alt="" loading="lazy" width={128} height={128} style={{objectFit:"contain",width:"100%",height:"100%"}}/>;
}
