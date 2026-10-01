CREATE TABLE `error_patterns` (
	`user_id` text NOT NULL,
	`pattern_key` text NOT NULL,
	`error_code` text NOT NULL,
	`target_id` text NOT NULL,
	`occurrence_count` integer DEFAULT 1 NOT NULL,
	`state` text DEFAULT 'emerging' NOT NULL,
	`first_seen_at` integer NOT NULL,
	`last_seen_at` integer NOT NULL,
	`last_event_id` text NOT NULL,
	`recommendation_id` text,
	`next_review_at` integer,
	`policy_revision` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`user_id`, `pattern_key`)
);
--> statement-breakpoint
CREATE INDEX `idx_error_patterns_user_state_review` ON `error_patterns` (`user_id`,`state`,`next_review_at`);--> statement-breakpoint
CREATE TABLE `learning_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`client_event_id` text NOT NULL,
	`session_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`event_type` text NOT NULL,
	`entity_id` text,
	`content_revision` integer NOT NULL,
	`payload_json` text NOT NULL,
	`occurred_at` integer NOT NULL,
	`received_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uidx_learning_events_user_client_event` ON `learning_events` (`user_id`,`client_event_id`);--> statement-breakpoint
CREATE INDEX `idx_learning_events_user_lesson_received` ON `learning_events` (`user_id`,`lesson_id`,`received_at`);--> statement-breakpoint
CREATE INDEX `idx_learning_events_user_received` ON `learning_events` (`user_id`,`received_at`);--> statement-breakpoint
CREATE TABLE `lesson_progress` (
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`flow_revision` integer NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL,
	`can_do_result` text,
	`active_phase_id` text,
	`session_id` text,
	`snapshot_json` text DEFAULT '{}' NOT NULL,
	`started_at` integer,
	`updated_at` integer NOT NULL,
	`completed_at` integer,
	`version` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`user_id`, `lesson_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_lesson_progress_user_status` ON `lesson_progress` (`user_id`,`status`);--> statement-breakpoint
CREATE TABLE `saved_study_items` (
	`user_id` text NOT NULL,
	`study_item_id` text NOT NULL,
	`review_item_id` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`saved_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `study_item_id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uidx_saved_study_items_user_review_item` ON `saved_study_items` (`user_id`,`review_item_id`);--> statement-breakpoint
CREATE TABLE `study_item_sources` (
	`user_id` text NOT NULL,
	`study_item_id` text NOT NULL,
	`source_type` text NOT NULL,
	`source_id` text NOT NULL,
	`source_context_id` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `study_item_id`, `source_type`, `source_id`, `source_context_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_study_item_sources_user_item` ON `study_item_sources` (`user_id`,`study_item_id`);