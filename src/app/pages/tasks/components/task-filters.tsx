"use client";

import { CircleXIcon, FilterIcon, ListFilterIcon } from "lucide-react";
import { useId, useRef } from "react";

import type { TaskWithRelations } from "../functions";
import { TaskPriorityBadge } from "./task-priority-badge";
import { TaskStatusBadge } from "./task-status-badge";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/app/components/ui/popover";
import { cn } from "@/lib/utils/cn";

interface TaskFiltersProps {
	tasks: TaskWithRelations[];
	globalFilter: string;
	setGlobalFilter: (value: string) => void;
	columnFilters: Array<{ id: string; value: unknown }>;
	setColumnFilters: (filters: Array<{ id: string; value: unknown }>) => void;
}

type StatusOption = "todo" | "in_progress" | "completed" | "cancelled";
type PriorityOption = "low" | "medium" | "high" | "urgent";

const statusOptions: StatusOption[] = [
	"todo",
	"in_progress",
	"completed",
	"cancelled",
];
const priorityOptions: PriorityOption[] = ["low", "medium", "high", "urgent"];

export function TaskFilters({
	globalFilter,
	setGlobalFilter,
	columnFilters,
	setColumnFilters,
}: Omit<TaskFiltersProps, "tasks">) {
	const id = useId();
	const inputRef = useRef<HTMLInputElement>(null);

	const getFilterValue = (columnId: string): string[] => {
		const filter = columnFilters.find((f) => f.id === columnId);
		return (filter?.value as string[]) || [];
	};

	const updateFilter = (columnId: string, value: string, checked: boolean) => {
		const currentValues = getFilterValue(columnId);
		const newValues = checked
			? [...currentValues, value]
			: currentValues.filter((v) => v !== value);

		const newFilters = columnFilters.filter((f) => f.id !== columnId);
		if (newValues.length > 0) {
			newFilters.push({ id: columnId, value: newValues });
		}

		setColumnFilters(newFilters);
	};

	const selectedStatuses = getFilterValue("status");
	const selectedPriorities = getFilterValue("priority");

	const handleStatusChange = (checked: boolean, value: string) => {
		updateFilter("status", value, checked);
	};

	const handlePriorityChange = (checked: boolean, value: string) => {
		updateFilter("priority", value, checked);
	};

	return (
		<div className="flex flex-wrap items-center justify-between gap-3">
			<div className="flex items-center gap-3">
				{/* Filter by title or description */}
				<div className="relative">
					<Input
						id={`${id}-input`}
						ref={inputRef}
						className={cn(
							"peer min-w-60 ps-9",
							Boolean(globalFilter) && "pe-9",
						)}
						value={globalFilter ?? ""}
						onChange={(e) => setGlobalFilter(e.target.value)}
						placeholder="Search tasks..."
						type="text"
						aria-label="Search tasks by title or description"
					/>
					<div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
						<ListFilterIcon size={16} aria-hidden="true" />
					</div>
					{Boolean(globalFilter) && (
						<Button
							className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
							aria-label="Clear filter"
							onClick={() => {
								setGlobalFilter("");
								if (inputRef.current) {
									inputRef.current.focus();
								}
							}}
						>
							<CircleXIcon size={16} aria-hidden="true" />
						</Button>
					)}
				</div>

				{/* Filter by status */}
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="outline">
							<FilterIcon
								className="-ms-1 opacity-60"
								size={16}
								aria-hidden="true"
							/>
							Status
							{selectedStatuses.length > 0 && (
								<span className="-me-1 inline-flex h-5 max-h-full items-center rounded border bg-background px-1 font-[inherit] font-medium text-[0.625rem] text-muted-foreground/70">
									{selectedStatuses.length}
								</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto min-w-36 p-3" align="start">
						<div className="space-y-3">
							<div className="font-medium text-muted-foreground text-xs">
								Filters
							</div>
							<div className="space-y-3">
								{statusOptions.map((value, i) => (
									<div key={value} className="flex items-center gap-2">
										<Checkbox
											id={`${id}-status-${i}`}
											checked={selectedStatuses.includes(value)}
											onCheckedChange={(checked: boolean) =>
												handleStatusChange(checked, value)
											}
										/>
										<Label
											htmlFor={`${id}-status-${i}`}
											className="flex grow justify-between gap-2 font-normal"
										>
											<TaskStatusBadge status={value} />
										</Label>
									</div>
								))}
							</div>
						</div>
					</PopoverContent>
				</Popover>

				{/* Filter by priority */}
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="outline">
							<FilterIcon
								className="-ms-1 opacity-60"
								size={16}
								aria-hidden="true"
							/>
							Priority
							{selectedPriorities.length > 0 && (
								<span className="-me-1 inline-flex h-5 max-h-full items-center rounded border bg-background px-1 font-[inherit] font-medium text-[0.625rem] text-muted-foreground/70">
									{selectedPriorities.length}
								</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto min-w-36 p-3" align="start">
						<div className="space-y-3">
							<div className="font-medium text-muted-foreground text-xs">
								Filters
							</div>
							<div className="space-y-3">
								{priorityOptions.map((value, i) => (
									<div key={value} className="flex items-center gap-2">
										<Checkbox
											id={`${id}-priority-${i}`}
											checked={selectedPriorities.includes(value)}
											onCheckedChange={(checked: boolean) =>
												handlePriorityChange(checked, value)
											}
										/>
										<Label
											htmlFor={`${id}-priority-${i}`}
											className="flex grow justify-between gap-2 font-normal"
										>
											<TaskPriorityBadge priority={value} />
										</Label>
									</div>
								))}
							</div>
						</div>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
}
