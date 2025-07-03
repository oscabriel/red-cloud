import type { InferSelectModel } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

import { user } from "./auth-schema";

export const project = sqliteTable("project", {
	id: text()
		.primaryKey()
		.$defaultFn(() => nanoid()),
	name: text().notNull(),
	description: text(),
	color: text(),
	createdAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
	updatedAt: integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
});

export const task = sqliteTable(
	"task",
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => nanoid()),
		title: text().notNull(),
		description: text(),
		status: text({ enum: ["todo", "in_progress", "completed", "cancelled"] })
			.notNull()
			.default("todo"),
		priority: text({ enum: ["low", "medium", "high", "urgent"] })
			.notNull()
			.default("medium"),
		assigneeId: text().references(() => user.id, { onDelete: "set null" }),
		projectId: text().references(() => project.id, { onDelete: "cascade" }),
		dueDate: integer({ mode: "timestamp" }),
		createdAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
		updatedAt: integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
	},
	(table) => [
		index("task_status_idx").on(table.status),
		index("task_assignee_idx").on(table.assigneeId),
		index("task_created_at_idx").on(table.createdAt),
	],
);

// Type exports
export type Task = InferSelectModel<typeof task>;
export type Project = InferSelectModel<typeof project>;
