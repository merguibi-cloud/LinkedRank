CREATE TABLE `agent_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`userId` int NOT NULL,
	`taskId` int,
	`action` varchar(100) NOT NULL,
	`level` enum('debug','info','warning','error') DEFAULT 'info',
	`message` text NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_memory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('user_preference','content_style','feedback','performance_insight','audience_insight','topic_expertise','best_practice') NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`importance` enum('low','medium','high','critical') DEFAULT 'medium',
	`confidence` varchar(10),
	`source` varchar(100),
	`context` text,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_memory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('generate_post','generate_carousel','generate_infographic','suggest_response','detect_trend','analyze_performance','suggest_connection','schedule_post') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('pending','in_progress','awaiting_approval','approved','rejected','completed','failed') DEFAULT 'pending',
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`scheduledFor` timestamp,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`inputData` text,
	`outputData` text,
	`requiresApproval` boolean DEFAULT true,
	`approvedAt` timestamp,
	`approvedBy` int,
	`rejectionReason` text,
	`errorMessage` text,
	`retryCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` enum('content_creator','trend_hunter','engagement_manager','growth_strategist','network_builder') NOT NULL,
	`description` text,
	`avatar` varchar(50),
	`status` enum('active','paused','learning','error') DEFAULT 'paused',
	`lastActiveAt` timestamp,
	`autonomyLevel` enum('supervised','semi_autonomous','autonomous') DEFAULT 'supervised',
	`requiresApproval` boolean DEFAULT true,
	`tasksCompleted` int DEFAULT 0,
	`tasksApproved` int DEFAULT 0,
	`tasksRejected` int DEFAULT 0,
	`successRate` varchar(10),
	`config` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `carousel_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`thumbnail` text,
	`slideCount` int DEFAULT 5,
	`layout` text NOT NULL,
	`colorScheme` varchar(50),
	`fontFamily` varchar(100),
	`category` enum('educational','storytelling','tips_list','comparison','case_study','statistics','how_to') DEFAULT 'educational',
	`usageCount` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`isPremium` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `carousel_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generated_carousels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`templateId` int,
	`agentTaskId` int,
	`title` varchar(255) NOT NULL,
	`topic` varchar(255),
	`slides` text NOT NULL,
	`pdfUrl` text,
	`pdfKey` varchar(255),
	`previewImages` text,
	`status` enum('draft','generating','ready','published','failed') DEFAULT 'draft',
	`linkedinPostId` varchar(100),
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `generated_carousels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `infographic_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`thumbnail` text,
	`layout` text NOT NULL,
	`dimensions` varchar(50) DEFAULT '1080x1350',
	`category` enum('statistics','process','comparison','timeline','hierarchy','list','quote') DEFAULT 'statistics',
	`usageCount` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`isPremium` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `infographic_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trend_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`agentId` int,
	`topic` varchar(255) NOT NULL,
	`description` text,
	`trendScore` int DEFAULT 0,
	`growthRate` varchar(20),
	`mentionCount` int DEFAULT 0,
	`sources` text,
	`relatedPosts` text,
	`suggestedPostContent` text,
	`suggestedPostType` enum('text','carousel','infographic','video'),
	`status` enum('new','viewed','acted_on','dismissed') DEFAULT 'new',
	`detectedAt` timestamp DEFAULT (now()),
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trend_alerts_id` PRIMARY KEY(`id`)
);
