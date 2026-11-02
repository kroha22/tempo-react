CREATE TABLE `study_review_events` (
	`user_id` text NOT NULL,
	`client_event_id` text NOT NULL,
	`study_item_id` text NOT NULL,
	`review_item_id` text NOT NULL,
	`grade` integer NOT NULL,
	`expected_version` integer NOT NULL,
	`result_json` text NOT NULL,
	`reviewed_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `client_event_id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uidx_study_review_event_version` ON `study_review_events` (`user_id`,`review_item_id`,`expected_version`);--> statement-breakpoint
CREATE TABLE `study_review_progress` (
	`user_id` text NOT NULL,
	`review_item_id` text NOT NULL,
	`due` integer NOT NULL,
	`interval` real NOT NULL,
	`ease` real NOT NULL,
	`repetitions` integer NOT NULL,
	`lapses` integer NOT NULL,
	`last_grade` integer NOT NULL,
	`reviewed_at` integer NOT NULL,
	`version` integer NOT NULL,
	PRIMARY KEY(`user_id`, `review_item_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_study_review_user_due` ON `study_review_progress` (`user_id`,`due`);