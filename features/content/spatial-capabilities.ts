import type {WordLearningSet} from "./word-learning-library";
export function spatialCapability(set?:WordLearningSet){
  if(set?.aliases.some(id=>id==="collection:space-positions"||id==="collection:pairs-location"))return "placement";
  if(set?.aliases.includes("collection:space-directions"))return "dictation";
  return null;
}
