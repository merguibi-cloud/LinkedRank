CREATE TABLE `auto_publish_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`queueId` int,
	`content` text NOT NULL,
	`linkedinPostId` varchar(100),
	`publishedAt` timestamp,
	`likes` int DEFAULT 0,
	`comments` int DEFAULT 0,
	`shares` int DEFAULT 0,
	`impressions` int DEFAULT 0,
	`status` enum('success','failed') DEFAULT 'success',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auto_publish_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auto_publish_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`generatedFrom` text,
	`scheduledFor` timestamp NOT NULL,
	`status` enum('pending','publishing','published','failed','cancelled') DEFAULT 'pending',
	`linkedinPostId` varchar(100),
	`publishedAt` timestamp,
	`errorMessage` text,
	`retryCount` int DEFAULT 0,
	`lastRetryAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auto_publish_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auto_publish_schedule` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`publishTime` varchar(5) NOT NULL,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auto_publish_schedule_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auto_publish_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`isEnabled` boolean DEFAULT false,
	`sector` varchar(100),
	`targetAudience` text,
	`tone` enum('professional','casual','inspirational','educational','provocative') DEFAULT 'professional',
	`language` enum('FR','EN','AR','ES','DE') DEFAULT 'FR',
	`viralityLevel` enum('low','medium','high') DEFAULT 'medium',
	`contentLength` enum('short','medium','long') DEFAULT 'medium',
	`includeEmojis` boolean DEFAULT true,
	`includeHashtags` boolean DEFAULT true,
	`includeCallToAction` boolean DEFAULT true,
	`inspirationCreators` text,
	`inspirationTopics` text,
	`personalContext` text,
	`avoidTopics` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auto_publish_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `auto_publish_settings_userId_unique` UNIQUE(`userId`)
);
