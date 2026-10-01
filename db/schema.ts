import { index, integer, primaryKey, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const flashcardProgress = sqliteTable("flashcard_progress", {
  userId: text("user_id").notNull(),
  cardId: text("card_id").notNull(),
  due: integer("due").notNull(),
  interval: real("interval").notNull().default(0),
  ease: real("ease").notNull().default(2.5),
  repetitions: integer("repetitions").notNull().default(0),
  lapses: integer("lapses").notNull().default(0),
  lastGrade: integer("last_grade"),
}, (table) => [primaryKey({ columns: [table.userId, table.cardId] })]);

export const lessonProgress = sqliteTable("lesson_progress", {
  userId: text("user_id").notNull(),
  lessonId: text("lesson_id").notNull(),
  flowRevision: integer("flow_revision").notNull(),
  status: text("status", { enum: ["not_started", "active", "finished"] }).notNull().default("not_started"),
  canDoResult: text("can_do_result", { enum: ["demonstrated", "partial", "not_yet"] }),
  activePhaseId: text("active_phase_id"),
  sessionId: text("session_id"),
  snapshotJson: text("snapshot_json").notNull().default("{}"),
  startedAt: integer("started_at"),
  updatedAt: integer("updated_at").notNull(),
  completedAt: integer("completed_at"),
  version: integer("version").notNull().default(1),
}, (table) => [
  primaryKey({ columns: [table.userId, table.lessonId] }),
  index("idx_lesson_progress_user_status").on(table.userId, table.status),
]);

export const learningEvents = sqliteTable("learning_events", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  clientEventId: text("client_event_id").notNull(),
  sessionId: text("session_id").notNull(),
  lessonId: text("lesson_id").notNull(),
  eventType: text("event_type", { enum: ["session_started", "phase_completed", "exercise_attempt", "scene_completed", "lesson_completed", "checkpoint_result", "error"] }).notNull(),
  entityId: text("entity_id"),
  contentRevision: integer("content_revision").notNull(),
  payloadJson: text("payload_json").notNull(),
  occurredAt: integer("occurred_at").notNull(),
  receivedAt: integer("received_at").notNull(),
}, (table) => [
  uniqueIndex("uidx_learning_events_user_client_event").on(table.userId, table.clientEventId),
  index("idx_learning_events_user_lesson_received").on(table.userId, table.lessonId, table.receivedAt),
  index("idx_learning_events_user_received").on(table.userId, table.receivedAt),
]);

export const savedStudyItems = sqliteTable("saved_study_items", {
  userId: text("user_id").notNull(),
  studyItemId: text("study_item_id").notNull(),
  reviewItemId: text("review_item_id").notNull(),
  status: text("status", { enum: ["active", "archived"] }).notNull().default("active"),
  savedAt: integer("saved_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.studyItemId] }),
  uniqueIndex("uidx_saved_study_items_user_review_item").on(table.userId, table.reviewItemId),
]);

export const studyItemSources = sqliteTable("study_item_sources", {
  userId: text("user_id").notNull(),
  studyItemId: text("study_item_id").notNull(),
  sourceType: text("source_type", { enum: ["lesson", "topic", "scene", "summary", "checkpoint"] }).notNull(),
  sourceId: text("source_id").notNull(),
  sourceContextId: text("source_context_id").notNull().default(""),
  createdAt: integer("created_at").notNull(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.studyItemId, table.sourceType, table.sourceId, table.sourceContextId] }),
  index("idx_study_item_sources_user_item").on(table.userId, table.studyItemId),
]);

export const errorPatterns = sqliteTable("error_patterns", {
  userId: text("user_id").notNull(),
  patternKey: text("pattern_key").notNull(),
  errorCode: text("error_code").notNull(),
  targetId: text("target_id").notNull(),
  occurrenceCount: integer("occurrence_count").notNull().default(1),
  state: text("state", { enum: ["emerging", "active", "improving", "resolved"] }).notNull().default("emerging"),
  firstSeenAt: integer("first_seen_at").notNull(),
  lastSeenAt: integer("last_seen_at").notNull(),
  lastEventId: text("last_event_id").notNull(),
  recommendationId: text("recommendation_id"),
  nextReviewAt: integer("next_review_at"),
  policyRevision: integer("policy_revision").notNull().default(1),
}, (table) => [
  primaryKey({ columns: [table.userId, table.patternKey] }),
  index("idx_error_patterns_user_state_review").on(table.userId, table.state, table.nextReviewAt),
]);
