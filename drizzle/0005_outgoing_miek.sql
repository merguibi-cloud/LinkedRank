ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionPlan` enum('starter','pro','business') DEFAULT 'starter';--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` varchar(50);