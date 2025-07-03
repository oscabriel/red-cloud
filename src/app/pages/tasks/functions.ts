"use server";

import { desc, eq, inArray } from "drizzle-orm";
import { requestInfo } from "rwsdk/worker";

import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import type { CreateTaskInput, Project, Task } from "@/db/schema/tasks-schema";
import { project, task } from "@/db/schema/tasks-schema";
import { REALTIME_KEYS, triggerRealtimeUpdate } from "@/lib/utils/realtime";
import type { ServerFunctionResponse } from "@/types/server-functions";

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

		// Validate required fields
		if (!data.title?.trim()) {
			return {
				success: false,
				error: "Task title is required",
			};
		}

		// Parse due date if provided
		let dueDate: Date | undefined;
		if (data.dueDate) {
			dueDate = new Date(data.dueDate);
			if (Number.isNaN(dueDate.getTime())) {
				return {
					success: false,
					error: "Invalid due date format",
				};
			}
		}

		// Create task input with defaults
		const taskInput: CreateTaskInput = {
			title: data.title.trim(),
			description: data.description?.trim() || null,
			status: data.status || "todo",
			priority: data.priority || "medium",
			assigneeId: data.assigneeId || null,
			projectId: data.projectId || null,
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

		if (!data.id) {
			return {
				success: false,
				error: "Task ID is required",
			};
		}

		// Check if task exists
		const existingTask = await db
			.select()
			.from(task)
			.where(eq(task.id, data.id))
			.limit(1);

		if (existingTask.length === 0) {
			return {
				success: false,
				error: "Task not found",
			};
		}

		// Parse due date if provided
		let dueDate: Date | null | undefined;
		if (data.dueDate !== undefined) {
			if (data.dueDate === "") {
				dueDate = null; // Clear due date
			} else {
				dueDate = new Date(data.dueDate);
				if (Number.isNaN(dueDate.getTime())) {
					return {
						success: false,
						error: "Invalid due date format",
					};
				}
			}
		}

		// Build update object with only provided fields
		const updateData: Partial<CreateTaskInput> = {};
		if (data.title !== undefined) updateData.title = data.title.trim();
		if (data.description !== undefined)
			updateData.description = data.description?.trim() || null;
		if (data.status !== undefined) updateData.status = data.status;
		if (data.priority !== undefined) updateData.priority = data.priority;
		if (data.assigneeId !== undefined)
			updateData.assigneeId = data.assigneeId || null;
		if (data.projectId !== undefined)
			updateData.projectId = data.projectId || null;
		if (dueDate !== undefined) updateData.dueDate = dueDate;

		// Update task in database
		const [updatedTask] = await db
			.update(task)
			.set(updateData)
			.where(eq(task.id, data.id))
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

		if (!taskIds || taskIds.length === 0) {
			return {
				success: false,
				error: "No task IDs provided",
			};
		}

		// Delete the tasks
		await db.delete(task).where(inArray(task.id, taskIds));

		// Trigger realtime updates for all tasks clients
		await triggerRealtimeUpdate(REALTIME_KEYS.TASKS);

		return {
			success: true,
			message: `${taskIds.length} task${taskIds.length === 1 ? "" : "s"} deleted successfully`,
		};
	} catch (error) {
		console.error("Failed to bulk delete tasks:", error);
		return {
			success: false,
			error: "Failed to delete tasks. Please try again.",
		};
	}
}
