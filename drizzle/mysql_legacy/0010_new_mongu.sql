CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('agent_task_completed','agent_task_failed','agent_needs_approval','trend_detected','post_published','post_performance','suggestion','system') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`agentId` int,
	`taskId` int,
	`postId` int,
	`actionUrl` varchar(500),
	`actionLabel` varchar(100),
	`isRead` boolean DEFAULT false,
	`readAt` timestamp,
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
