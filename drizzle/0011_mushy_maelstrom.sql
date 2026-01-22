ALTER TABLE `agents` ADD `scheduleEnabled` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `agents` ADD `scheduleDays` text;--> statement-breakpoint
ALTER TABLE `agents` ADD `scheduleHours` text;--> statement-breakpoint
ALTER TABLE `agents` ADD `scheduleTimezone` varchar(50) DEFAULT 'Europe/Paris';--> statement-breakpoint
ALTER TABLE `agents` ADD `tasksPerDay` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `agents` ADD `lastScheduledAt` timestamp;--> statement-breakpoint
ALTER TABLE `agents` ADD `nextScheduledAt` timestamp;