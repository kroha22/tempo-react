export type SceneRelation = "inside" | "on" | "under" | "beside";

export type ScenePlacementResponse = {
  actorId: string;
  relation: SceneRelation;
  referenceId: string;
};

export type SceneTask = {
  id: string;
  expected: ScenePlacementResponse;
};

export function createPlacement(actorId: string, relation: SceneRelation, referenceId: string): ScenePlacementResponse {
  return { actorId, relation, referenceId };
}

export function sameSemanticPlacement(left: ScenePlacementResponse, right: ScenePlacementResponse): boolean {
  return left.actorId === right.actorId && left.relation === right.relation && left.referenceId === right.referenceId;
}
