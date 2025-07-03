"use client";

import type { TaskWithRelations } from "../functions";
import { TaskForm } from "./task-form";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/app/components/ui/dialog";

interface EditTaskDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	task: TaskWithRelations;
}

export function EditTaskDialog({
	open,
	onOpenChange,
	task,
}: EditTaskDialogProps) {
	const handleSuccess = () => {
		onOpenChange(false);
		// The form already triggers realtime updates and page refresh
	};

	const handleCancel = () => {
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Edit Task</DialogTitle>
					<DialogDescription>
						Update the task details using the form below.
					</DialogDescription>
				</DialogHeader>
				<TaskForm
					mode="edit"
					task={task}
					onSuccess={handleSuccess}
					onCancel={handleCancel}
				/>
			</DialogContent>
		</Dialog>
	);
}
