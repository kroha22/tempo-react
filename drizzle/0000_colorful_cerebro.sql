CREATE TABLE `flashcard_progress` (
	`user_id` text NOT NULL,
	`card_id` text NOT NULL,
	`due` integer NOT NULL,
	`interval` real DEFAULT 0 NOT NULL,
	`ease` real DEFAULT 2.5 NOT NULL,
	`repetitions` integer DEFAULT 0 NOT NULL,
	`lapses` integer DEFAULT 0 NOT NULL,
	`last_grade` integer,
	PRIMARY KEY(`user_id`, `card_id`)
);
