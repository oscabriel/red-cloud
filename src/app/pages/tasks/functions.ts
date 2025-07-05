"use server";

import type { InferInsertModel } from "drizzle-orm";
import { desc, eq, inArray } from "drizzle-orm";
import { requestInfo } from "rwsdk/worker";

import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import type { Project, Task } from "@/db/schema/tasks-schema";
import { project, task } from "@/db/schema/tasks-schema";
import { REALTIME_KEYS, triggerRealtimeUpdate } from "@/lib/utils/realtime";
import {
	bulkDeleteTasksSchema,
	createTaskSchema,
	updateTaskSchema,
} from "@/lib/validators/tasks";
import type { ServerFunctionResponse } from "@/types/server-functions";

// Database insert types
type TaskInsert = InferInsertModel<typeof task>;

// Task server function input types
export interface CreateTaskServerInput {
	title: string;
	description?: string;
	status?: "todo" | "in_progress" | "completed" | "cancelled";
	priority?: "low" | "medium" | "high" | "urgent";
	assigneeId?: string;
	projectId?: string;
	dueDate?: string; // ISO date string
}

export interface UpdateTaskServerInput extends Partial<CreateTaskServerInput> {
	id: string;
}

export interface TaskWithRelations extends Task {
	assignee?: { id: string; name: string | null; email: string } | null;
	project?: { id: string; name: string; color: string | null } | null;
}

// Re-export Project type for convenience
export type { Project } from "@/db/schema/tasks-schema";

// Server function response types
export interface TasksDataResponse {
	success: boolean;
	tasks?: TaskWithRelations[];
	projects?: Project[];
	error?: string;
}

export async function getAllTasksWithRelations(): Promise<TasksDataResponse> {
	try {
		const tasksWithRelations = await db
			.select({
				id: task.id,
				title: task.title,
				description: task.description,
				status: task.status,
				priority: task.priority,
				assigneeId: task.assigneeId,
				projectId: task.projectId,
				dueDate: task.dueDate,
				createdAt: task.createdAt,
				updatedAt: task.updatedAt,
				organizationId: task.organizationId,
				assignee: {
					id: user.id,
					name: user.name,
					email: user.email,
				},
				project: {
					id: project.id,
					name: project.name,
					color: project.color,
				},
			})
			.from(task)
			.leftJoin(user, eq(task.assigneeId, user.id))
			.leftJoin(project, eq(task.projectId, project.id))
			.orderBy(desc(task.createdAt));

		// Transform the results to match TaskWithRelations interface
		const tasks: TaskWithRelations[] = tasksWithRelations.map((row) => ({
			id: row.id,
			title: row.title,
			description: row.description,
			status: row.status,
			priority: row.priority,
			assigneeId: row.assigneeId,
			projectId: row.projectId,
			dueDate: row.dueDate,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
			assignee: row.assignee?.id ? row.assignee : null,
			project: row.project?.id ? row.project : null,
			organizationId: row.organizationId,
		}));

		return {
			success: true,
			tasks,
		};
	} catch (error) {
		console.error("Failed to fetch tasks with relations:", error);
		return {
			success: false,
			error: "Failed to load tasks",
		};
	}
}

export async function getAllProjects(): Promise<{
	success: boolean;
	projects?: Project[];
	error?: string;
}> {
	try {
		const projects = await db
			.select()
			.from(project)
			.orderBy(desc(project.createdAt));

		return {
			success: true,
			projects,
		};
	} catch (error) {
		console.error("Failed to fetch projects:", error);
		return {
			success: false,
			error: "Failed to load projects",
		};
	}
}

export async function createTask(
	data: CreateTaskServerInput,
): Promise<ServerFunctionResponse<Task>> {
	try {
		const { ctx } = requestInfo;

		if (!ctx.user) {
			return {
				success: false,
				error: "Authentication required",
			};
		}

		// Validate input using Zod schema
		const validationResult = createTaskSchema.safeParse(data);
		if (!validationResult.success) {
			const errorMessages = validationResult.error.errors.map(
				(error) => error.message,
			);
			return {
				success: false,
				error: errorMessages.join(", "),
			};
		}

		const validatedData = validationResult.data;

		// Parse due date if provided
		let dueDate: Date | undefined;
		if (validatedData.dueDate) {
			dueDate = new Date(validatedData.dueDate);
		}

		// Create task input with validated data
		const taskInput: TaskInsert = {
			title: validatedData.title.trim(),
			description: validatedData.description?.trim() || null,
			status: validatedData.status,
			priority: validatedData.priority,
			assigneeId: validatedData.assigneeId || null,
			projectId: validatedData.projectId || null,
			dueDate: dueDate || null,
		};

		// Insert task into database
		const [newTask] = await db.insert(task).values(taskInput).returning();

		// Trigger realtime updates for all tasks clients
		await triggerRealtimeUpdate(REALTIME_KEYS.TASKS);

		return {
			success: true,
			message: "Task created successfully!",
			data: newTask,
		};
	} catch (error) {
		console.error("Failed to create task:", error);
		return {
			success: false,
			error: "Failed to create task. Please try again.",
		};
	}
}

export async function updateTask(
	data: UpdateTaskServerInput,
): Promise<ServerFunctionResponse<Task>> {
	try {
		const { ctx } = requestInfo;

		if (!ctx.user) {
			return {
				success: false,
				error: "Authentication required",
			};
		}

		// Validate input using Zod schema
		const validationResult = updateTaskSchema.safeParse(data);
		if (!validationResult.success) {
			const errorMessages = validationResult.error.errors.map(
				(error) => error.message,
			);
			return {
				success: false,
				error: errorMessages.join(", "),
			};
		}

		const validatedData = validationResult.data;

		// Check if task exists
		const existingTask = await db
			.select()
			.from(task)
			.where(eq(task.id, validatedData.id))
			.limit(1);

		if (existingTask.length === 0) {
			return {
				success: false,
				error: "Task not found",
			};
		}

		// Parse due date if provided
		let dueDate: Date | null | undefined;
		if (validatedData.dueDate !== undefined) {
			if (validatedData.dueDate === "") {
				dueDate = null; // Clear due date
			} else {
				dueDate = new Date(validatedData.dueDate);
			}
		}

		// Build update object with only provided fields
		const updateData: Partial<TaskInsert> = {};
		if (validatedData.title !== undefined)
			updateData.title = validatedData.title.trim();
		if (validatedData.description !== undefined)
			updateData.description = validatedData.description?.trim() || null;
		if (validatedData.status !== undefined)
			updateData.status = validatedData.status;
		if (validatedData.priority !== undefined)
			updateData.priority = validatedData.priority;
		if (validatedData.assigneeId !== undefined)
			updateData.assigneeId = validatedData.assigneeId || null;
		if (validatedData.projectId !== undefined)
			updateData.projectId = validatedData.projectId || null;
		if (dueDate !== undefined) updateData.dueDate = dueDate;

		// Update task in database
		const [updatedTask] = await db
			.update(task)
			.set(updateData)
			.where(eq(task.id, validatedData.id))
			.returning();

		// Trigger realtime updates for all tasks clients
		await triggerRealtimeUpdate(REALTIME_KEYS.TASKS);

		return {
			success: true,
			message: "Task updated successfully!",
			data: updatedTask,
		};
	} catch (error) {
		console.error("Failed to update task:", error);
		return {
			success: false,
			error: "Failed to update task. Please try again.",
		};
	}
}

export async function deleteTask(
	taskId: string,
): Promise<ServerFunctionResponse> {
	try {
		const { ctx } = requestInfo;

		if (!ctx.user) {
			return {
				success: false,
				error: "Authentication required",
			};
		}

		if (!taskId) {
			return {
				success: false,
				error: "Task ID is required",
			};
		}

		// Check if task exists
		const existingTask = await db
			.select()
			.from(task)
			.where(eq(task.id, taskId))
			.limit(1);

		if (existingTask.length === 0) {
			return {
				success: false,
				error: "Task not found",
			};
		}

		// Delete the task
		await db.delete(task).where(eq(task.id, taskId));

		// Trigger realtime updates for all tasks clients
		await triggerRealtimeUpdate(REALTIME_KEYS.TASKS);

		return {
			success: true,
			message: "Task deleted successfully",
		};
	} catch (error) {
		console.error("Failed to delete task:", error);
		return {
			success: false,
			error: "Failed to delete task. Please try again.",
		};
	}
}

export async function bulkDeleteTasks(
	taskIds: string[],
): Promise<ServerFunctionResponse> {
	try {
		const { ctx } = requestInfo;

		if (!ctx.user) {
			return {
				success: false,
				error: "Authentication required",
			};
		}

		// Validate input using Zod schema
		const validationResult = bulkDeleteTasksSchema.safeParse({ taskIds });
		if (!validationResult.success) {
			const errorMessages = validationResult.error.errors.map(
				(error) => error.message,
			);
			return {
				success: false,
				error: errorMessages.join(", "),
			};
		}

		const validatedData = validationResult.data;

		// Delete the tasks
		await db.delete(task).where(inArray(task.id, validatedData.taskIds));

		// Trigger realtime updates for all tasks clients
		await triggerRealtimeUpdate(REALTIME_KEYS.TASKS);

		return {
			success: true,
			message: `${validatedData.taskIds.length} task${validatedData.taskIds.length === 1 ? "" : "s"} deleted successfully`,
		};
	} catch (error) {
		console.error("Failed to bulk delete tasks:", error);
		return {
			success: false,
			error: "Failed to delete tasks. Please try again.",
		};
	}
}
