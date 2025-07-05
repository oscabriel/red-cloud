PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_project` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`color` text,
	`organizationId` text,
	`createdAt` integer,
	`updatedAt` integer,
	FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_project`("id", "name", "description", "color", "organizationId", "createdAt", "updatedAt") SELECT "id", "name", "description", "color", "organizationId", "createdAt", "updatedAt" FROM `project`;--> statement-breakpoint
DROP TABLE `project`;--> statement-breakpoint
ALTER TABLE `__new_project` RENAME TO `project`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `project_org_idx` ON `project` (`organizationId`);--> statement-breakpoint
CREATE TABLE `__new_task` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'todo' NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`assigneeId` text,
	`projectId` text,
	`organizationId` text,
	`dueDate` integer,
	`createdAt` integer,
	`updatedAt` integer,
	FOREIGN KEY (`assigneeId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`projectId`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_task`("id", "title", "description", "status", "priority", "assigneeId", "projectId", "organizationId", "dueDate", "createdAt", "updatedAt") SELECT "id", "title", "description", "status", "priority", "assigneeId", "projectId", "organizationId", "dueDate", "createdAt", "updatedAt" FROM `task`;--> statement-breakpoint
DROP TABLE `task`;--> statement-breakpoint
ALTER TABLE `__new_task` RENAME TO `task`;--> statement-breakpoint
CREATE INDEX `task_status_idx` ON `task` (`status`);--> statement-breakpoint
CREATE INDEX `task_assignee_idx` ON `task` (`assigneeId`);--> statement-breakpoint
CREATE INDEX `task_created_at_idx` ON `task` (`createdAt`);--> statement-breakpoint
CREATE INDEX `task_org_idx` ON `task` (`organizationId`);