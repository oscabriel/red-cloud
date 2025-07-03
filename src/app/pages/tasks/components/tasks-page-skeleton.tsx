import { Skeleton } from "@/app/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/app/components/ui/table";

export function TasksPageSkeleton() {
	return (
		<div className="w-full px-4">
			<div className="space-y-4 sm:space-y-8">
				{/* Header skeleton */}
				<div className="space-y-2 text-center">
					<div className="mx-auto h-8 w-48 animate-pulse rounded bg-muted" />
					<div className="mx-auto h-4 w-96 animate-pulse rounded bg-muted" />
				</div>

				{/* Table skeleton matching actual TasksTable structure */}
				<div className="space-y-4">
					{/* Filters skeleton */}
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<Skeleton className="h-10 w-64" />
							<Skeleton className="h-10 w-32" />
							<Skeleton className="h-10 w-32" />
						</div>
						<div className="flex items-center gap-3">
							<Skeleton className="h-10 w-24" />
							<Skeleton className="h-10 w-28" />
						</div>
					</div>

					{/* Table skeleton */}
					<div className="overflow-hidden rounded-md border bg-background">
						<Table className="table-fixed">
							<TableHeader>
								<TableRow className="hover:bg-transparent">
									<TableHead style={{ width: "48px" }} className="h-11">
										<Skeleton className="h-4 w-4" />
									</TableHead>
									<TableHead style={{ width: "200px" }} className="h-11">
										<Skeleton className="h-4 w-12" />
									</TableHead>
									<TableHead style={{ width: "120px" }} className="h-11">
										<Skeleton className="h-4 w-12" />
									</TableHead>
									<TableHead style={{ width: "120px" }} className="h-11">
										<Skeleton className="h-4 w-14" />
									</TableHead>
									<TableHead style={{ width: "150px" }} className="h-11">
										<Skeleton className="h-4 w-16" />
									</TableHead>
									<TableHead style={{ width: "150px" }} className="h-11">
										<Skeleton className="h-4 w-14" />
									</TableHead>
									<TableHead style={{ width: "120px" }} className="h-11">
										<Skeleton className="h-4 w-16" />
									</TableHead>
									<TableHead style={{ width: "60px" }} className="h-11">
										<span className="sr-only">Actions</span>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{Array.from({ length: 10 }, (_, i) => (
									<TableRow key={`skeleton-row-${i + 1}`}>
										{/* Checkbox column */}
										<TableCell className="last:py-0">
											<Skeleton className="h-4 w-4" />
										</TableCell>
										{/* Title column */}
										<TableCell className="last:py-0">
											<Skeleton className="h-4 w-32" />
										</TableCell>
										{/* Status column */}
										<TableCell className="last:py-0">
											<Skeleton className="h-6 w-16 rounded-full" />
										</TableCell>
										{/* Priority column */}
										<TableCell className="last:py-0">
											<Skeleton className="h-6 w-16 rounded-full" />
										</TableCell>
										{/* Assignee column */}
										<TableCell className="last:py-0">
											<Skeleton className="h-4 w-24" />
										</TableCell>
										{/* Project column */}
										<TableCell className="last:py-0">
											<div className="flex items-center gap-2">
												<Skeleton className="h-3 w-3 rounded-full" />
												<Skeleton className="h-4 w-20" />
											</div>
										</TableCell>
										{/* Due Date column */}
										<TableCell className="last:py-0">
											<Skeleton className="h-4 w-16" />
										</TableCell>
										{/* Actions column */}
										<TableCell className="last:py-0">
											<Skeleton className="h-8 w-8 rounded" />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{/* Pagination skeleton */}
					<div className="flex items-center justify-between gap-8">
						{/* Results per page */}
						<div className="flex items-center gap-3">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-10 w-16" />
						</div>
						{/* Page number information */}
						<div className="flex grow justify-end">
							<Skeleton className="h-4 w-32" />
						</div>
						{/* Pagination buttons */}
						<div className="flex items-center gap-2">
							<Skeleton className="h-10 w-10" />
							<Skeleton className="h-10 w-10" />
							<Skeleton className="h-10 w-10" />
							<Skeleton className="h-10 w-10" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
