CREATE TABLE `linkedin_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`language` enum('FR','EN') NOT NULL,
	`theme` varchar(100) NOT NULL,
	`category` varchar(100),
	`imageUrl` text,
	`imageKey` varchar(255),
	`videoUrl` text,
	`mediaType` enum('image','video','none') DEFAULT 'none',
	`mediaSource` text,
	`linkedinPostId` varchar(100),
	`publishedAt` timestamp,
	`scheduledAt` timestamp,
	`status` enum('draft','scheduled','published','failed') NOT NULL DEFAULT 'draft',
	`likes` int DEFAULT 0,
	`comments` int DEFAULT 0,
	`shares` int DEFAULT 0,
	`impressions` int DEFAULT 0,
	`isViral` boolean DEFAULT false,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `linkedin_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `linkedin_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`tokenExpiresAt` timestamp,
	`linkedinUserId` varchar(100),
	`profileUrl` text,
	`isConnected` boolean DEFAULT false,
	`autoPublish` boolean DEFAULT false,
	`defaultLanguage` enum('FR','EN') DEFAULT 'FR',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `linkedin_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`nameEn` varchar(100),
	`description` text,
	`color` varchar(20),
	`icon` varchar(50),
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `post_categories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `post_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`imageUrl` text NOT NULL,
	`imageKey` varchar(255) NOT NULL,
	`type` enum('quote','citation','infographic','custom') DEFAULT 'quote',
	`prompt` text,
	`width` int DEFAULT 1200,
	`height` int DEFAULT 1200,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_images_id` PRIMARY KEY(`id`)
);
