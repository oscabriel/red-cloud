"use client";

import { TaskForm } from "./task-form";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/app/components/ui/dialog";

interface AddTaskDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AddTaskDialog({ open, onOpenChange }: AddTaskDialogProps) {
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
					<DialogTitle>Add New Task</DialogTitle>
					<DialogDescription>
						Create a new task by filling out the form below.
					</DialogDescription>
				</DialogHeader>
				<TaskForm
					mode="create"
					onSuccess={handleSuccess}
					onCancel={handleCancel}
				/>
			</DialogContent>
		</Dialog>
	);
}
