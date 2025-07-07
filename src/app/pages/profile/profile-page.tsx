import type { RequestInfo } from "rwsdk/worker";

import { DeleteAccountButton } from "./components/delete-account-button";
import { ProfileInfo } from "./components/profile-info";
import { SessionManager } from "./components/session-manager";
import { getUserProfile } from "./functions";
import { SignOutButton } from "@/app/components/navigation/sign-out-button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Separator } from "@/app/components/ui/separator";
import { auth } from "@/lib/auth";

export async function ProfilePage({ ctx, request }: RequestInfo) {
	if (!ctx.user) {
		throw new Error("User not authenticated");
	}

	// Fetch user profile and session list - use session data from middleware
	const [userProfile, activeSessions] = await Promise.all([
		getUserProfile(ctx.user.id as string),
		auth.api
			.listSessions({
				headers: request.headers,
			})
			.catch(() => []),
	]);

	// Get the base URL for the auth client
	const url = new URL(request.url);
	const authUrl = `${url.protocol}//${url.host}`;

	return (
		<div className="container mx-auto max-w-4xl">
			<div className="space-y-4 sm:space-y-8">
				{/* Page Header */}
				<div className="space-y-2 text-center">
					<h1 className="font-bold text-2xl tracking-tight sm:text-3xl">
						Profile
					</h1>
					<p className="text-muted-foreground text-sm sm:text-base">
						Manage your account settings and profile information
					</p>
				</div>

				<Card className="bg-background">
					<CardContent className="space-y-3 sm:space-y-6">
						{/* Profile Information */}
						<ProfileInfo user={userProfile} />

						<Separator />

						{/* Active Sessions */}
						<SessionManager
							authUrl={authUrl}
							currentSession={
								ctx.session && ctx.user
									? { session: ctx.session, user: ctx.user }
									: null
							}
							activeSessions={
								Array.isArray(activeSessions) ? activeSessions : []
							}
						/>

						<Separator />

						{/* Action Buttons */}
						<div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-x-3 sm:space-y-0">
							<SignOutButton
								authUrl={authUrl}
								variant="outline"
								className="flex w-full items-center justify-center space-x-2 text-sm sm:w-auto"
							/>
							<DeleteAccountButton authUrl={authUrl} />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
