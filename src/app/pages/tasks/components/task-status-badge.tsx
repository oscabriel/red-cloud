import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/lib/utils/cn";

interface TaskStatusBadgeProps {
	status: "todo" | "in_progress" | "completed" | "cancelled";
	className?: string;
}

const statusConfig = {
	todo: {
		label: "To Do",
		variant: "secondary" as const,
		className:
			"bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200",
	},
	in_progress: {
		label: "In Progress",
		variant: "default" as const,
		className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
	},
	completed: {
		label: "Completed",
		variant: "outline" as const,
		className:
			"bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
	},
	cancelled: {
		label: "Cancelled",
		variant: "destructive" as const,
		className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
	},
};

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
	const config = statusConfig[status];

	return (
		<Badge variant={config.variant} className={cn(config.className, className)}>
			{config.label}
		</Badge>
	);
}
