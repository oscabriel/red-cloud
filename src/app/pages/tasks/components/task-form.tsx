"use client";

import { CalendarIcon } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import type {
	CreateTaskServerInput,
	Project,
	TaskWithRelations,
	UpdateTaskServerInput,
} from "../functions";
import { createTask, getAllProjects, updateTask } from "../functions";
import { Button } from "@/app/components/ui/button";
import { Calendar } from "@/app/components/ui/calendar";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/app/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import { cn } from "@/lib/utils/cn";

interface TaskFormProps {
	mode: "create" | "edit";
	task?: TaskWithRelations;
	onSuccess?: () => void;
	onCancel?: () => void;
}

interface FormData {
	title: string;
	description: string;
	status: "todo" | "in_progress" | "completed" | "cancelled";
	priority: "low" | "medium" | "high" | "urgent";
	assigneeId: string;
	projectId: string;
	dueDate: Date | undefined;
}

const statusOptions = [
	{ value: "todo", label: "To Do" },
	{ value: "in_progress", label: "In Progress" },
	{ value: "completed", label: "Completed" },
	{ value: "cancelled", label: "Cancelled" },
] as const;

const priorityOptions = [
	{ value: "low", label: "Low" },
	{ value: "medium", label: "Medium" },
	{ value: "high", label: "High" },
	{ value: "urgent", label: "Urgent" },
] as const;

export function TaskForm({ mode, task, onSuccess, onCancel }: TaskFormProps) {
	const [isPending, startTransition] = useTransition();
	const [projects, setProjects] = useState<Project[]>([]);
	const [formData, setFormData] = useState<FormData>({
		title: task?.title || "",
		description: task?.description || "",
		status: task?.status || "todo",
		priority: task?.priority || "medium",
		assigneeId: task?.assigneeId || "",
		projectId: task?.projectId || "none",
		dueDate: task?.dueDate ? new Date(task.dueDate) : undefined,
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Load projects on component mount
	useEffect(() => {
		const loadProjects = async () => {
			try {
				const result = await getAllProjects();
				if (result.success && result.projects) {
					setProjects(result.projects);
				}
			} catch (error) {
				console.error("Error loading projects:", error);
			}
		};
		loadProjects();
	}, []);

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.title.trim()) {
			newErrors.title = "Title is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		startTransition(async () => {
			try {
				let result: { success: boolean; error?: string } | undefined;

				if (mode === "create") {
					const input: CreateTaskServerInput = {
						title: formData.title.trim(),
						description: formData.description.trim() || undefined,
						status: formData.status,
						priority: formData.priority,
						assigneeId: formData.assigneeId || undefined,
						projectId:
							formData.projectId === "none"
								? undefined
								: formData.projectId || undefined,
						dueDate: formData.dueDate?.toISOString(),
					};
					result = await createTask(input);
				} else if (task) {
					const input: UpdateTaskServerInput = {
						id: task.id,
						title: formData.title.trim(),
						description: formData.description.trim() || undefined,
						status: formData.status,
						priority: formData.priority,
						assigneeId: formData.assigneeId || undefined,
						projectId:
							formData.projectId === "none"
								? undefined
								: formData.projectId || undefined,
						dueDate: formData.dueDate?.toISOString(),
					};
					result = await updateTask(input);
				}

				if (result?.success) {
					toast.success(
						mode === "create"
							? "Task created successfully"
							: "Task updated successfully",
					);
					onSuccess?.();
				} else {
					toast.error(result?.error || "Failed to save task");
				}
			} catch (error) {
				console.error("Error saving task:", error);
				toast.error("An unexpected error occurred");
			}
		});
	};

	const handleInputChange = (
		field: keyof FormData,
		value: string | Date | undefined,
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const formatDate = (date: Date | undefined): string => {
		if (!date) return "Pick a date";
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}).format(date);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Title */}
			<div className="space-y-2">
				<Label htmlFor="title">
					Title <span className="text-red-500">*</span>
				</Label>
				<Input
					id="title"
					value={formData.title}
					onChange={(e) => handleInputChange("title", e.target.value)}
					placeholder="Enter task title"
					className={cn(errors.title && "border-red-500")}
				/>
				{errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
			</div>

			{/* Description */}
			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					value={formData.description}
					onChange={(e) => handleInputChange("description", e.target.value)}
					placeholder="Enter task description"
					rows={3}
				/>
			</div>

			{/* Status */}
			<div className="space-y-2">
				<Label>Status</Label>
				<Select
					value={formData.status}
					onValueChange={(value) =>
						handleInputChange("status", value as FormData["status"])
					}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select status" />
					</SelectTrigger>
					<SelectContent>
						{statusOptions.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Priority */}
			<div className="space-y-2">
				<Label>Priority</Label>
				<Select
					value={formData.priority}
					onValueChange={(value) =>
						handleInputChange("priority", value as FormData["priority"])
					}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select priority" />
					</SelectTrigger>
					<SelectContent>
						{priorityOptions.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Project */}
			<div className="space-y-2">
				<Label>Project</Label>
				<Select
					value={formData.projectId}
					onValueChange={(value) => handleInputChange("projectId", value)}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select project" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="none">No project</SelectItem>
						{projects.map((project) => (
							<SelectItem key={project.id} value={project.id}>
								<div className="flex items-center gap-2">
									{project.color && (
										<div
											className="h-3 w-3 rounded-full"
											style={{ backgroundColor: project.color }}
										/>
									)}
									{project.name}
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Due Date */}
			<div className="space-y-2">
				<Label>Due Date</Label>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn(
								"w-full justify-start text-left font-normal",
								!formData.dueDate && "text-muted-foreground",
							)}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{formatDate(formData.dueDate)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="single"
							selected={formData.dueDate}
							onSelect={(date: Date | undefined) =>
								handleInputChange("dueDate", date)
							}
							disabled={(date: Date) => date < new Date("1900-01-01")}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
			</div>

			{/* Form Actions */}
			<div className="flex justify-end space-x-2">
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending
						? mode === "create"
							? "Creating..."
							: "Updating..."
						: mode === "create"
							? "Create Task"
							: "Update Task"}
				</Button>
			</div>
		</form>
	);
}
