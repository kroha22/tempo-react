import { sameSemanticPlacement, type ScenePlacementResponse, type SceneTask } from "./domain.ts";

export type SceneValidationResult = {
  accepted: boolean;
  semanticEvidence: "demonstrated" | "not_yet";
  response: ScenePlacementResponse;
};

export function validateScenePlacement(task: SceneTask, response: ScenePlacementResponse): SceneValidationResult {
  const accepted = sameSemanticPlacement(task.expected, response);
  return { accepted, semanticEvidence: accepted ? "demonstrated" : "not_yet", response };
}
