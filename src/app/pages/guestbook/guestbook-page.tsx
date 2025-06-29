import type { RequestInfo } from "rwsdk/worker";

import { GuestbookForm } from "@/app/pages/guestbook/components/guestbook-form";
import { GuestbookList } from "@/app/pages/guestbook/components/guestbook-list";
import { getAllGuestbookMessages } from "@/app/pages/guestbook/functions";

// Main Guestbook Page Component
export async function GuestbookPage({ ctx }: RequestInfo) {
	const messagesResult = await getAllGuestbookMessages();

	return (
		<div className="container mx-auto max-w-4xl">
			<div className="space-y-4 sm:space-y-8">
				{/* Page Header */}
				<div className="space-y-2 text-center">
					<h1 className="font-bold text-2xl tracking-tight sm:text-3xl">
						Guestbook
					</h1>
					<p className="text-muted-foreground text-sm sm:text-base">
						Leave a message and see what others have shared
					</p>
				</div>

				{/* Guestbook Form */}
				<GuestbookForm user={ctx?.user} />
				{/* Messages List - Server component that will re-render on realtime updates */}
				<GuestbookList
					messagesResult={messagesResult}
					currentUser={ctx?.user}
				/>
			</div>
		</div>
	);
}
