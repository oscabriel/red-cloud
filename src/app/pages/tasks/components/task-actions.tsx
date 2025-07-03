"use client";

import { EllipsisIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { TaskWithRelations } from "../functions";
import { deleteTask } from "../functions";
import { EditTaskDialog } from "./edit-task-dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import { Button } from "@/app/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

interface TaskActionsProps {
	task: TaskWithRelations;
	onTaskUpdated?: () => void;
}

export function TaskActions({ task, onTaskUpdated }: TaskActionsProps) {
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [isPending, startTransition] = useTransition();

	const handleEdit = () => {
		setShowEditDialog(true);
	};

	const handleDuplicate = () => {
		// TODO: Implement duplicate functionality
		toast.info("Duplicate functionality coming soon!");
		console.log("Duplicate task:", task.id);
	};

	const handleArchive = () => {
		// TODO: Implement archive functionality
		toast.info("Archive functionality coming soon!");
		console.log("Archive task:", task.id);
	};

	const handleDelete = () => {
		startTransition(async () => {
			try {
				const result = await deleteTask(task.id);

				if (result.success) {
					toast.success(result.message || "Task deleted successfully");
					onTaskUpdated?.();
				} else {
					toast.error(result.error || "Failed to delete task");
				}
			} catch (error) {
				console.error("Error deleting task:", error);
				toast.error("An unexpected error occurred");
			} finally {
				setShowDeleteDialog(false);
			}
		});
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<div className="flex justify-end">
						<Button
							size="icon"
							variant="ghost"
							className="shadow-none"
							aria-label="Edit item"
							disabled={isPending}
						>
							<EllipsisIcon size={16} aria-hidden="true" />
						</Button>
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuGroup>
						<DropdownMenuItem onClick={handleEdit}>
							<span>Edit</span>
							<DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuItem onClick={handleDuplicate}>
							<span>Duplicate</span>
							<DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem onClick={handleArchive}>
							<span>Archive</span>
							<DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="text-destructive focus:text-destructive"
						onClick={() => setShowDeleteDialog(true)}
					>
						<span>Delete</span>
						<DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Task</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{task.title}"? This action cannot
							be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isPending ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<EditTaskDialog
				open={showEditDialog}
				onOpenChange={setShowEditDialog}
				task={task}
			/>
		</>
	);
}
