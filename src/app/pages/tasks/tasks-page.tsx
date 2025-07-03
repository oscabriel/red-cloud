import { Suspense } from "react";

import { TasksPageSkeleton } from "./components/tasks-page-skeleton";
import { TasksTable } from "./components/tasks-table";
import { getAllProjects, getAllTasksWithRelations } from "./functions";
import type { AppContext } from "@/types/app";

async function TasksContent() {
	try {
		// Fetch tasks and projects data in parallel
		const [tasksResult, projectsResult] = await Promise.all([
			getAllTasksWithRelations(),
			getAllProjects(),
		]);

		// Handle errors
		if (!tasksResult.success) {
			return (
				<div className="w-full">
					<div className="text-center">
						<h1 className="mb-2 font-bold text-2xl text-destructive">
							Error Loading Tasks
						</h1>
						<p className="text-muted-foreground">{tasksResult.error}</p>
					</div>
				</div>
			);
		}

		if (!projectsResult.success) {
			return (
				<div className="w-full">
					<div className="text-center">
						<h1 className="mb-2 font-bold text-2xl text-destructive">
							Error Loading Projects
						</h1>
						<p className="text-muted-foreground">{projectsResult.error}</p>
					</div>
				</div>
			);
		}

		// Render with data
		return (
			<div className="w-full px-4">
				<div className="space-y-4 sm:space-y-8">
					<div className="space-y-2 text-center">
						<h1 className="font-bold text-2xl tracking-tight sm:text-3xl">
							Tasks
						</h1>
						<p className="text-muted-foreground text-sm sm:text-base">
							Manage your tasks and projects efficiently
						</p>
					</div>

					<TasksTable tasks={tasksResult.tasks || []} />
				</div>
			</div>
		);
	} catch (_error) {
		return (
			<div className="w-full px-4">
				<div className="text-center">
					<h1 className="mb-2 font-bold text-2xl text-destructive">
						Unexpected Error
					</h1>
					<p className="text-muted-foreground">
						Failed to load tasks data. Please try again.
					</p>
				</div>
			</div>
		);
	}
}

export function TasksPage({ ctx: _ }: { ctx: AppContext }) {
	return (
		<Suspense fallback={<TasksPageSkeleton />}>
			<TasksContent />
		</Suspense>
	);
}
