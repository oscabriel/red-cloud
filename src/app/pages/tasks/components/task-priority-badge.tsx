import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/lib/utils/cn";

interface TaskPriorityBadgeProps {
	priority: "low" | "medium" | "high" | "urgent";
	className?: string;
}

const priorityConfig = {
	low: {
		label: "Low",
		variant: "secondary" as const,
		className: "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200",
	},
	medium: {
		label: "Medium",
		variant: "default" as const,
		className:
			"bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
	},
	high: {
		label: "High",
		variant: "destructive" as const,
		className:
			"bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
	},
	urgent: {
		label: "Urgent",
		variant: "destructive" as const,
		className:
			"bg-red-100 text-red-800 border-red-200 hover:bg-red-200 font-semibold",
	},
};

export function TaskPriorityBadge({
	priority,
	className,
}: TaskPriorityBadgeProps) {
	const config = priorityConfig[priority];

	return (
		<Badge variant={config.variant} className={cn(config.className, className)}>
			{config.label}
		</Badge>
	);
}
