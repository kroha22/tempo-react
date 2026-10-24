import { houseImageActivity } from "./house.ts";
import { clothingImageActivity } from "./clothing.ts";
import { sceneImageActivities } from "./picture-scenes.ts";
import { tableImageActivity } from "./table-scene.ts";
import { bodyImages } from "./body-scenes.ts";

/** Shared registry for catalog bindings, visible mechanics and cover choices. */
export const vocabularyImages=[houseImageActivity,clothingImageActivity,...sceneImageActivities,tableImageActivity,...bodyImages];
