import type {
  CanonicalEntity,
  ContentPack,
  LegacyVerbDeckItem,
  LessonFlowDefinition,
} from "./types.ts";

const ID_PATTERN = /^[a-z0-9-]+(?::[a-z0-9-]+)+$/;

export class ContentValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(`Content validation failed with ${issues.length} issue(s).`);
    this.name = "ContentValidationError";
    this.issues = issues;
  }
}

function allCanonicalEntities(pack: ContentPack): CanonicalEntity[] {
  return [
    ...pack.courses,
    ...pack.levels,
    ...pack.units,
    ...pack.canDos,
    ...pack.knowledgeTargets,
    ...pack.chunks,
    ...pack.examples,
    ...pack.studyItems,
    ...pack.contentBlocks,
    ...pack.exerciseDefinitions,
    ...pack.exerciseItems,
    ...pack.lessons,
  ];
}

function reachable(flow: LessonFlowDefinition, startId: string): Set<string> {
  const seen = new Set<string>();
  const queue = [startId];

  while (queue.length) {
    const current = queue.shift()!;
    if (seen.has(current)) continue;
    seen.add(current);
    for (const transition of flow.transitions) {
      if (transition.fromPhaseId === current) queue.push(transition.toPhaseId);
    }
  }

  return seen;
}

export function collectContentValidationIssues(pack: ContentPack): string[] {
  const issues: string[] = [];
  const entities = allCanonicalEntities(pack);
  const structuralIds = [
    ...pack.exerciseUses.map((use) => use.id),
    ...pack.flows.map((flow) => flow.id),
    ...pack.flows.flatMap((flow) => flow.phases.map((phase) => phase.id)),
  ];
  const ids = [...entities.map((entity) => entity.id), ...structuralIds];
  const knownIds = new Set(ids);
  const seen = new Set<string>();

  for (const id of ids) {
    if (!ID_PATTERN.test(id)) issues.push(`Invalid stable ID: ${id}`);
    if (seen.has(id)) issues.push(`Duplicate stable ID: ${id}`);
    seen.add(id);
  }

  const requireRef = (ownerId: string, refId: string) => {
    if (!knownIds.has(refId)) issues.push(`${ownerId} references missing ID ${refId}`);
  };
  const requireText = (ownerId: string, key: string) => {
    if (!(key in pack.locales.ru)) issues.push(`${ownerId} references missing ru text key ${key}`);
  };

  for (const course of pack.courses) {
    requireText(course.id, course.titleKey);
    course.levelIds.forEach((id) => requireRef(course.id, id));
  }
  for (const level of pack.levels) {
    requireText(level.id, level.titleKey);
    [...level.unitIds, ...level.completionCanDoIds].forEach((id) => requireRef(level.id, id));
  }
  for (const unit of pack.units) {
    requireText(unit.id, unit.titleKey);
    [...unit.lessonIds, ...unit.primaryCanDoIds].forEach((id) => requireRef(unit.id, id));
    if (unit.checkpointId) requireRef(unit.id, unit.checkpointId);
  }
  for (const canDo of pack.canDos) {
    requireText(canDo.id, canDo.statementKey);
    canDo.successCriteriaKeys.forEach((key) => requireText(canDo.id, key));
    canDo.requiredKnowledgeIds.forEach((id) => requireRef(canDo.id, id));
  }
  for (const target of pack.knowledgeTargets) requireText(target.id, target.titleKey);
  for (const chunk of pack.chunks) {
    requireText(chunk.id, chunk.glossKey);
    chunk.exampleIds.forEach((id) => requireRef(chunk.id, id));
  }
  for (const example of pack.examples) {
    requireText(example.id, example.translationKey);
    example.targetIds.forEach((id) => requireRef(example.id, id));
    for (const profileId of example.presentationProfileIds) {
      if (!pack.publishedPresentationProfileIds.includes(profileId)) {
        issues.push(`${example.id} uses unpublished presentation profile ${profileId}`);
      }
    }
    if (example.status === "published" || example.status === "reviewed") {
      if (!example.quality.ptPtReviewed) issues.push(`${example.id} lacks pt-PT review`);
      if (!example.quality.translationReviewedLocales.includes("ru")) {
        issues.push(`${example.id} lacks ru translation review`);
      }
    }
  }
  for (const item of pack.studyItems) {
    requireRef(item.id, item.defaultExampleId);
    if (item.target.type === "chunk") requireRef(item.id, item.target.chunkId);
    if (item.display.type === "chunk") requireText(item.id, item.display.translationKey);
    if (item.display.type === "verb") {
      requireText(item.id, item.display.translationKey);
      if (!item.display.infinitive.trim()) issues.push(`${item.id} has an empty infinitive`);
    }
    if (item.display.type === "noun") {
      requireText(item.id, item.display.translationKey);
      if (!item.display.definiteArticle || !item.display.plural || !item.display.pluralDefiniteArticle) {
        issues.push(`${item.id} noun display lacks article or plural`);
      }
    }
  }
  for (const block of pack.contentBlocks) {
    if (block.titleKey) requireText(block.id, block.titleKey);
    requireText(block.id, block.bodyKey);
    block.exampleIds.forEach((id) => requireRef(block.id, id));
  }
  for (const item of pack.exerciseItems) {
    requireRef(item.id, item.definitionId);
    requireRef(item.id, item.primaryDiagnosticTargetId);
    item.targetIds.forEach((id) => requireRef(item.id, id));
    requireText(item.id, item.instructionKey);
    requireText(item.id, item.promptKey);
    if (item.options) {
      const optionIds = new Set(item.options.map((option) => option.id));
      if (!item.correctOptionId || !optionIds.has(item.correctOptionId)) {
        issues.push(`${item.id} has no resolvable correct option`);
      }
      for (const option of item.options) {
        if (option.id !== item.correctOptionId && !option.rationaleKey) {
          issues.push(`${item.id} distractor ${option.id} lacks a rationale`);
        }
        if (option.rationaleKey) requireText(item.id, option.rationaleKey);
      }
    } else if (!item.acceptedTokenSequences?.length) {
      issues.push(`${item.id} has no accepted answer`);
    }
  }
  for (const use of pack.exerciseUses) {
    requireRef(use.id, use.exerciseItemId);
    requireRef(use.id, use.lessonId);
    requireRef(use.id, use.phaseId);
  }
  for (const lesson of pack.lessons) {
    requireText(lesson.id, lesson.titleKey);
    if (lesson.primaryCanDoIds.length !== 1) {
      issues.push(`${lesson.id} must have exactly one primary Can-Do`);
    }
    lesson.primaryCanDoIds.forEach((id) => requireRef(lesson.id, id));
    lesson.targets.forEach((target) => requireRef(lesson.id, target.entityId));
    lesson.contentBlockIds.forEach((id) => requireRef(lesson.id, id));
    lesson.exerciseUseIds.forEach((id) => requireRef(lesson.id, id));
    lesson.prerequisiteIds.forEach((id) => requireRef(lesson.id, id));
    requireRef(lesson.id, lesson.flowId);
    lesson.completionRule.requiredPhaseIds.forEach((id) => requireRef(lesson.id, id));
    lesson.completionRule.requiredExerciseUseIds.forEach((id) => requireRef(lesson.id, id));
    const lexicalLoad = lesson.targets.filter(
      (target) => target.role === "new" && target.countsTowardLexicalLoad,
    ).length;
    if (lexicalLoad > 14) issues.push(`${lesson.id} lexical load ${lexicalLoad} exceeds 14`);
    if (lesson.lessonType === "checkpoint" && lesson.targets.some((target) => target.role === "new")) {
      issues.push(`${lesson.id} checkpoint introduces a new target`);
    }
  }
  for (const flow of pack.flows) {
    requireRef(flow.id, flow.lessonId);
    requireRef(flow.id, flow.entryPhaseId);
    requireRef(flow.id, flow.terminalPhaseId);
    for (const phase of flow.phases) {
      phase.contentBlockIds.forEach((id) => requireRef(phase.id, id));
      phase.exerciseUseIds.forEach((id) => requireRef(phase.id, id));
      phase.targetIds.forEach((id) => requireRef(phase.id, id));
    }
    for (const transition of flow.transitions) {
      requireRef(flow.id, transition.fromPhaseId);
      requireRef(flow.id, transition.toPhaseId);
    }
    const fromEntry = reachable(flow, flow.entryPhaseId);
    if (!fromEntry.has(flow.terminalPhaseId)) {
      issues.push(`${flow.id} cannot reach terminal phase from entry`);
    }
    for (const phase of flow.phases.filter((candidate) => candidate.required)) {
      if (!fromEntry.has(phase.id)) issues.push(`${flow.id} required phase ${phase.id} is unreachable`);
      if (!reachable(flow, phase.id).has(flow.terminalPhaseId)) {
        issues.push(`${flow.id} required phase ${phase.id} cannot reach terminal phase`);
      }
    }
  }

  const manifestIds = Object.keys(pack.manifest.entityRevisions);
  const revisionedIds = [...entities.map((entity) => entity.id), ...pack.flows.map((flow) => flow.id)];
  for (const id of revisionedIds) {
    if (!manifestIds.includes(id)) issues.push(`Manifest lacks revision for ${id}`);
  }
  for (const id of manifestIds) {
    if (!revisionedIds.includes(id)) issues.push(`Manifest contains unknown revision ID ${id}`);
  }

  return issues;
}

export function validateContentPack(pack: ContentPack): void {
  const issues = collectContentValidationIssues(pack);
  if (issues.length) throw new ContentValidationError(issues);
}

export function collectLegacyVerbDeckIssues(cards: LegacyVerbDeckItem[]): string[] {
  const issues: string[] = [];
  if (cards.length !== 1000) issues.push(`Legacy verb deck has ${cards.length} items, expected 1000`);

  const ids = new Set<string>();
  const infinitives = new Set<string>();
  cards.forEach((card, index) => {
    const expectedId = `v${String(index + 1).padStart(4, "0")}`;
    if (card.id !== expectedId) issues.push(`Legacy verb deck position ${index + 1} has ${card.id}, expected ${expectedId}`);
    if (card.rank !== index + 1) issues.push(`${card.id} has rank ${card.rank}, expected ${index + 1}`);
    if (ids.has(card.id)) issues.push(`Duplicate legacy card ID ${card.id}`);
    if (infinitives.has(card.pt)) issues.push(`Duplicate legacy infinitive ${card.pt}`);
    ids.add(card.id);
    infinitives.add(card.pt);
  });

  return issues;
}

export function validateLegacyVerbDeck(cards: LegacyVerbDeckItem[]): void {
  const issues = collectLegacyVerbDeckIssues(cards);
  if (issues.length) throw new ContentValidationError(issues);
}
