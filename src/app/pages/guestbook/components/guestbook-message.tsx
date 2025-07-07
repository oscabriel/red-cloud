import { DeleteMessageButton } from "./delete-message-button";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import type { GuestBookMessage } from "@/db/schema/guestbook-schema";
import { formatDate } from "@/lib/utils/date";

interface GuestbookMessageProps {
	message: GuestBookMessage;
	canDelete: boolean;
}

export function GuestbookMessage({
	message,
	canDelete,
}: GuestbookMessageProps) {
	return (
		<Card className="gap-3 py-3 transition-all hover:shadow-md sm:py-4">
			<CardHeader className="px-3 pb-0 sm:px-4">
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
							<span className="font-bold text-base sm:text-lg">
								{message.name}
							</span>
							{message.country && (
								<span className="text-muted-foreground text-xs sm:text-sm">
									from {message.country}
								</span>
							)}
						</div>
						<div className="text-muted-foreground text-xs">
							{formatDate(message.createdAt)}
						</div>
					</div>
					{canDelete && <DeleteMessageButton messageId={message.id} />}
				</div>
			</CardHeader>
			<CardContent className="px-3 pt-0 sm:px-4">
				<p className="text-base text-foreground leading-relaxed">
					{message.message}
				</p>
			</CardContent>
		</Card>
	);
}
