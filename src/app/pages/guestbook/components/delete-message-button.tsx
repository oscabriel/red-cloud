"use client";

import { TrashIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/app/components/ui/button";
import { deleteGuestbookMessage } from "@/app/pages/guestbook/functions";

interface DeleteMessageButtonProps {
	messageId: number;
}

export function DeleteMessageButton({ messageId }: DeleteMessageButtonProps) {
	const [isPending, startTransition] = useTransition();
	const [showConfirm, setShowConfirm] = useState(false);

	const handleDelete = () => {
		startTransition(async () => {
			try {
				const result = await deleteGuestbookMessage(messageId);

				if (result.success) {
					toast.success(result.message || "Message deleted successfully!");
				} else {
					toast.error(result.error || "Failed to delete message");
				}
			} catch {
				toast.error("An unexpected error occurred");
			} finally {
				setShowConfirm(false);
			}
		});
	};

	if (showConfirm) {
		return (
			<div className="flex items-center gap-2">
				<Button
					size="sm"
					variant="destructive"
					onClick={handleDelete}
					disabled={isPending}
				>
					{isPending ? "Deleting..." : "Confirm"}
				</Button>
				<Button
					size="sm"
					variant="outline"
					onClick={() => setShowConfirm(false)}
					disabled={isPending}
				>
					Cancel
				</Button>
			</div>
		);
	}

	return (
		<Button
			size="sm"
			variant="ghost"
			onClick={() => setShowConfirm(true)}
			disabled={isPending}
			className="text-muted-foreground hover:text-destructive"
		>
			<TrashIcon className="h-4 w-4" />
		</Button>
	);
}
