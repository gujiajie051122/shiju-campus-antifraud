CREATE TABLE `ai_requests` (
	`request_id` text PRIMARY KEY NOT NULL,
	`actor_hash` text NOT NULL,
	`day` text NOT NULL,
	`feature` text NOT NULL,
	`model` text NOT NULL,
	`started_at` integer NOT NULL,
	`lease_until` integer NOT NULL,
	`finished_at` integer,
	`outcome` text NOT NULL,
	`http_status` integer,
	`prompt_tokens` integer,
	`completion_tokens` integer,
	`total_tokens` integer
);
--> statement-breakpoint
CREATE INDEX `ai_requests_day` ON `ai_requests` (`day`);--> statement-breakpoint
CREATE INDEX `ai_requests_actor_day` ON `ai_requests` (`actor_hash`,`day`);--> statement-breakpoint
CREATE INDEX `ai_requests_actor_started` ON `ai_requests` (`actor_hash`,`started_at`);--> statement-breakpoint
CREATE INDEX `ai_requests_active` ON `ai_requests` (`outcome`,`lease_until`);