"use client";

import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import {
	ChevronDownIcon,
	ChevronFirstIcon,
	ChevronLastIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronUpIcon,
	CircleAlertIcon,
	Columns3Icon,
	PlusIcon,
	TrashIcon,
} from "lucide-react";
import { useEffect, useId, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import type { TaskWithRelations } from "../functions";
import { bulkDeleteTasks } from "../functions";
import { AddTaskDialog } from "./add-task-dialog";
import { TaskActions } from "./task-actions";
import { TaskFilters } from "./task-filters";
import { TaskPriorityBadge } from "./task-priority-badge";
import { TaskStatusBadge } from "./task-status-badge";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Label } from "@/app/components/ui/label";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
} from "@/app/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/app/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/app/components/ui/table";
import { cn } from "@/lib/utils/cn";

interface TasksTableProps {
	tasks: TaskWithRelations[];
}

function formatDate(date: Date | null): string {
	if (!date) return "No due date";
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(date));
}

export function TasksTable({ tasks }: TasksTableProps) {
	const id = useId();
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [rowSelection, setRowSelection] = useState({});
	const [globalFilter, setGlobalFilter] = useState("");
	const [_isPending, startTransition] = useTransition();
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

	const [sorting, setSorting] = useState<SortingState>([
		{
			id: "title",
			desc: false,
		},
	]);

	// Create stable column definitions using useMemo
	const columns = useMemo<ColumnDef<TaskWithRelations>[]>(
		() => [
			// Select/checkbox column for row selection
			{
				id: "select",
				header: ({ table }) => (
					<Checkbox
						checked={
							table.getIsAllPageRowsSelected() ||
							(table.getIsSomePageRowsSelected() && "indeterminate")
						}
						onCheckedChange={(value) =>
							table.toggleAllPageRowsSelected(!!value)
						}
						aria-label="Select all"
					/>
				),
				cell: ({ row }) => (
					<Checkbox
						checked={row.getIsSelected()}
						onCheckedChange={(value) => row.toggleSelected(!!value)}
						aria-label="Select row"
					/>
				),
				size: 48,
				minSize: 48,
				maxSize: 48,
				enableSorting: false,
				enableHiding: false,
			},
			{
				header: "Title",
				accessorKey: "title",
				cell: ({ row }) => (
					<div className="font-medium">{row.getValue("title")}</div>
				),
				size: 200,
				enableHiding: false,
			},
			{
				header: "Status",
				accessorKey: "status",
				cell: ({ row }) => {
					const status = row.getValue("status") as
						| "todo"
						| "in_progress"
						| "completed"
						| "cancelled";
					return <TaskStatusBadge status={status} />;
				},
				size: 120,
				filterFn: "arrIncludes",
			},
			{
				header: "Priority",
				accessorKey: "priority",
				cell: ({ row }) => {
					const priority = row.getValue("priority") as
						| "low"
						| "medium"
						| "high"
						| "urgent";
					return <TaskPriorityBadge priority={priority} />;
				},
				size: 120,
				filterFn: "arrIncludes",
			},
			{
				header: "Assignee",
				accessorKey: "assignee",
				cell: ({ row }) => {
					const task = row.original;
					if (!task.assignee) {
						return (
							<span className="text-muted-foreground text-sm">Unassigned</span>
						);
					}
					return (
						<div className="text-sm">
							{task.assignee.name || task.assignee.email}
						</div>
					);
				},
				size: 150,
			},
			{
				header: "Project",
				accessorKey: "project",
				cell: ({ row }) => {
					const task = row.original;
					if (!task.project) {
						return (
							<span className="text-muted-foreground text-sm">No project</span>
						);
					}
					return (
						<div className="flex items-center gap-2">
							{task.project.color && (
								<div
									className="h-3 w-3 rounded-full"
									style={{ backgroundColor: task.project.color }}
								/>
							)}
							<span className="text-sm">{task.project.name}</span>
						</div>
					);
				},
				size: 150,
			},
			{
				header: "Due Date",
				accessorKey: "dueDate",
				cell: ({ row }) => {
					const dueDate = row.getValue("dueDate") as Date | null;
					return <div className="text-sm">{formatDate(dueDate)}</div>;
				},
				size: 120,
			},
			{
				id: "actions",
				header: () => <span className="sr-only">Actions</span>,
				cell: ({ row }) => {
					const task = row.original;
					return (
						<TaskActions
							task={task}
							onTaskUpdated={() => {
								// Realtime updates will automatically refresh the data
							}}
						/>
					);
				},
				size: 60,
				enableHiding: false,
			},
		],
		[],
	);

	const table = useReactTable({
		data: tasks,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		enableSortingRemoval: false,
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		getFilteredRowModel: getFilteredRowModel(),
		onRowSelectionChange: setRowSelection,
		globalFilterFn: "includesString",
		onGlobalFilterChange: setGlobalFilter,
		state: {
			sorting,
			pagination,
			columnFilters,
			columnVisibility,
			rowSelection,
			globalFilter,
		},
	});

	const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;

	const handleBulkDelete = () => {
		const selectedIds = table
			.getFilteredSelectedRowModel()
			.rows.map((row) => row.original.id);

		startTransition(async () => {
			try {
				const result = await bulkDeleteTasks(selectedIds);

				if (result.success) {
					toast.success(result.message || "Tasks deleted successfully");
					// Reset selection
					setRowSelection({});
					// Realtime updates will automatically refresh the data
				} else {
					toast.error(result.error || "Failed to delete tasks");
				}
			} catch (error) {
				console.error("Error deleting tasks:", error);
				toast.error("An unexpected error occurred");
			}
		});
	};

	const handleAddTask = () => {
		setIsAddDialogOpen(true);
	};

	// Keyboard shortcuts for table navigation
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Only handle shortcuts when not typing in input fields
			if (
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement
			) {
				return;
			}

			switch (event.key) {
				case "n":
					if (event.ctrlKey || event.metaKey) {
						event.preventDefault();
						handleAddTask();
					}
					break;
				case "Delete":
				case "Backspace":
					if (selectedRowCount > 0 && (event.ctrlKey || event.metaKey)) {
						event.preventDefault();
						handleBulkDelete();
					}
					break;
				case "ArrowLeft":
					if (table.getCanPreviousPage()) {
						table.previousPage();
					}
					break;
				case "ArrowRight":
					if (table.getCanNextPage()) {
						table.nextPage();
					}
					break;
				case "Escape":
					// Clear selection
					setRowSelection({});
					// Clear global filter
					setGlobalFilter("");
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [selectedRowCount, table]);

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<TaskFilters
					globalFilter={globalFilter}
					setGlobalFilter={setGlobalFilter}
					columnFilters={columnFilters}
					setColumnFilters={setColumnFilters}
				/>
				<div className="flex items-center gap-3">
					{/* Delete button */}
					{table.getSelectedRowModel().rows.length > 0 && (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button className="ml-auto" variant="outline">
									<TrashIcon
										className="-ms-1 opacity-60"
										size={16}
										aria-hidden="true"
									/>
									Delete
									<span className="-me-1 inline-flex h-5 max-h-full items-center rounded border bg-background px-1 font-[inherit] font-medium text-[0.625rem] text-muted-foreground/70">
										{table.getSelectedRowModel().rows.length}
									</span>
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
									<div
										className="flex size-9 shrink-0 items-center justify-center rounded-full border"
										aria-hidden="true"
									>
										<CircleAlertIcon className="opacity-80" size={16} />
									</div>
									<AlertDialogHeader>
										<AlertDialogTitle>
											Are you absolutely sure?
										</AlertDialogTitle>
										<AlertDialogDescription>
											This action cannot be undone. This will permanently delete{" "}
											{table.getSelectedRowModel().rows.length} selected{" "}
											{table.getSelectedRowModel().rows.length === 1
												? "task"
												: "tasks"}
											.
										</AlertDialogDescription>
									</AlertDialogHeader>
								</div>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction onClick={handleBulkDelete}>
										Delete
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					)}
					{/* Toggle columns visibility */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
								<Columns3Icon
									className="-ms-1 opacity-60"
									size={16}
									aria-hidden="true"
								/>
								View
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
							{table
								.getAllColumns()
								.filter((column) => column.getCanHide())
								.map((column) => {
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className="capitalize"
											checked={column.getIsVisible()}
											onCheckedChange={(value) =>
												column.toggleVisibility(!!value)
											}
											onSelect={(event) => event.preventDefault()}
										>
											{column.id}
										</DropdownMenuCheckboxItem>
									);
								})}
						</DropdownMenuContent>
					</DropdownMenu>
					{/* Add Task button */}
					<Button className="ml-auto" variant="outline" onClick={handleAddTask}>
						<PlusIcon
							className="-ms-1 opacity-60"
							size={16}
							aria-hidden="true"
						/>
						Add task
					</Button>
				</div>
			</div>

			{/* Add Task Dialog */}
			<AddTaskDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

			{/* Table */}
			<div className="overflow-hidden rounded-md border bg-background">
				<Table className="table-fixed">
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="hover:bg-transparent">
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											style={{ width: `${header.getSize()}px` }}
											className="h-11"
										>
											{header.isPlaceholder ? null : header.column.getCanSort() ? (
												<button
													type="button"
													className={cn(
														header.column.getCanSort() &&
															"flex h-full cursor-pointer select-none items-center justify-between gap-2",
													)}
													onClick={header.column.getToggleSortingHandler()}
													onKeyDown={(e) => {
														if (
															header.column.getCanSort() &&
															(e.key === "Enter" || e.key === " ")
														) {
															e.preventDefault();
															header.column.getToggleSortingHandler()?.(e);
														}
													}}
													tabIndex={header.column.getCanSort() ? 0 : undefined}
												>
													{flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
													{{
														asc: (
															<ChevronUpIcon
																className="shrink-0 opacity-60"
																size={16}
																aria-hidden="true"
															/>
														),
														desc: (
															<ChevronDownIcon
																className="shrink-0 opacity-60"
																size={16}
																aria-hidden="true"
															/>
														),
													}[header.column.getIsSorted() as string] ?? null}
												</button>
											) : (
												flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)
											)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id} className="last:py-0">
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between gap-8">
				{/* Results per page */}
				<div className="flex items-center gap-3">
					<Label htmlFor={id} className="max-sm:sr-only">
						Rows per page
					</Label>
					<Select
						value={table.getState().pagination.pageSize.toString()}
						onValueChange={(value) => {
							table.setPageSize(Number(value));
						}}
					>
						<SelectTrigger id={id} className="w-fit whitespace-nowrap">
							<SelectValue placeholder="Select number of results" />
						</SelectTrigger>
						<SelectContent className="[&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8">
							{[5, 10, 25, 50].map((pageSize) => (
								<SelectItem key={pageSize} value={pageSize.toString()}>
									{pageSize}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				{/* Page number information */}
				<div className="flex grow justify-end whitespace-nowrap text-muted-foreground text-sm">
					<p
						className="whitespace-nowrap text-muted-foreground text-sm"
						aria-live="polite"
					>
						<span className="text-foreground">
							{table.getState().pagination.pageIndex *
								table.getState().pagination.pageSize +
								1}
							-
							{Math.min(
								Math.max(
									table.getState().pagination.pageIndex *
										table.getState().pagination.pageSize +
										table.getState().pagination.pageSize,
									0,
								),
								table.getRowCount(),
							)}
						</span>{" "}
						of{" "}
						<span className="text-foreground">
							{table.getRowCount().toString()}
						</span>
					</p>
				</div>

				{/* Pagination buttons */}
				<div>
					<Pagination>
						<PaginationContent>
							{/* First page button */}
							<PaginationItem>
								<Button
									size="icon"
									variant="outline"
									className="disabled:pointer-events-none disabled:opacity-50"
									onClick={() => table.firstPage()}
									disabled={!table.getCanPreviousPage()}
									aria-label="Go to first page"
								>
									<ChevronFirstIcon size={16} aria-hidden="true" />
								</Button>
							</PaginationItem>
							{/* Previous page button */}
							<PaginationItem>
								<Button
									size="icon"
									variant="outline"
									className="disabled:pointer-events-none disabled:opacity-50"
									onClick={() => table.previousPage()}
									disabled={!table.getCanPreviousPage()}
									aria-label="Go to previous page"
								>
									<ChevronLeftIcon size={16} aria-hidden="true" />
								</Button>
							</PaginationItem>
							{/* Next page button */}
							<PaginationItem>
								<Button
									size="icon"
									variant="outline"
									className="disabled:pointer-events-none disabled:opacity-50"
									onClick={() => table.nextPage()}
									disabled={!table.getCanNextPage()}
									aria-label="Go to next page"
								>
									<ChevronRightIcon size={16} aria-hidden="true" />
								</Button>
							</PaginationItem>
							{/* Last page button */}
							<PaginationItem>
								<Button
									size="icon"
									variant="outline"
									className="disabled:pointer-events-none disabled:opacity-50"
									onClick={() => table.lastPage()}
									disabled={!table.getCanNextPage()}
									aria-label="Go to last page"
								>
									<ChevronLastIcon size={16} aria-hidden="true" />
								</Button>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			</div>
		</div>
	);
}
