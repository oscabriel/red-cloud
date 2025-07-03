import { z } from "zod";

// Validation schema for creating tasks
export const createTaskSchema = z.object({
	title: z
		.string()
		.min(1, "Title is required")
		.max(255, "Title must be 255 characters or less"),
	description: z
		.string()
		.max(1000, "Description must be 1000 characters or less")
		.optional(),
	status: z
		.enum(["todo", "in_progress", "completed", "cancelled"])
		.default("todo"),
	priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
	assigneeId: z.string().uuid("Invalid assignee ID").optional(),
	projectId: z.string().uuid("Invalid project ID").optional(),
	dueDate: z.string().datetime("Invalid due date format").optional(),
});

// Validation schema for updating tasks
export const updateTaskSchema = createTaskSchema.partial().extend({
	id: z.string().uuid("Invalid task ID"),
});

// TODO: Project management schemas - implement when project CRUD is added
// export const createProjectSchema = z.object({...});
// export const updateProjectSchema = createProjectSchema.partial().extend({...});

// Validation schema for bulk operations
export const bulkDeleteTasksSchema = z.object({
	taskIds: z
		.array(z.string().uuid("Invalid task ID"))
		.min(1, "At least one task ID is required"),
});

// Type exports for use in components
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type BulkDeleteTasksInput = z.infer<typeof bulkDeleteTasksSchema>;
