"use client";

import { Laptop, Loader2, Monitor, Smartphone, Tablet } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { UAParser } from "ua-parser-js";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { setupAuthClient } from "@/lib/auth/auth-client";
import { link } from "@/lib/utils/links";

interface SessionData {
	id: string;
	token: string;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
	ipAddress?: string | null;
	userAgent?: string | null;
	userId: string;
}

interface CurrentSession {
	session?: {
		id: string;
		token: string;
		userId: string;
		expiresAt: Date;
		ipAddress?: string | null;
		userAgent?: string | null;
	};
	user?: {
		id: string;
		name: string | null;
		email: string;
		emailVerified: boolean | null;
		image?: string | null;
		createdAt: Date | null;
		updatedAt: Date | null;
	};
}

interface SessionManagerProps {
	authUrl: string;
	currentSession: CurrentSession | null;
	activeSessions: SessionData[];
}

function getDeviceIcon(userAgent?: string | null) {
	if (!userAgent) return <Monitor className="h-4 w-4" />;

	const parser = new UAParser(userAgent);
	const device = parser.getDevice();

	if (device.type === "mobile") {
		return <Smartphone className="h-4 w-4" />;
	}
	if (device.type === "tablet") {
		return <Tablet className="h-4 w-4" />;
	}
	return <Laptop className="h-4 w-4" />;
}

function getDeviceInfo(userAgent?: string | null): string {
	if (!userAgent) return "Unknown Device";

	const parser = new UAParser(userAgent);
	const browser = parser.getBrowser().name || "Unknown Browser";
	const os = parser.getOS().name || "Unknown OS";

	return `${browser}, ${os}`;
}

function isCurrentSession(
	session: SessionData,
	currentSession: CurrentSession | null,
): boolean {
	return session.token === currentSession?.session?.token;
}

export function SessionManager({
	authUrl,
	currentSession,
	activeSessions,
}: SessionManagerProps) {
	const [sessions, setSessions] = useState<SessionData[]>(activeSessions);
	const [isTerminating, setIsTerminating] = useState<string>();
	const [isPending, startTransition] = useTransition();

	const authClient = setupAuthClient(authUrl);

	// Memoize filtered sessions to avoid unnecessary re-filtering
	const validSessions = useMemo(
		() => sessions.filter((session) => session.userAgent),
		[sessions],
	);

	const removeActiveSession = (sessionId: string) =>
		setSessions(sessions.filter((session) => session.id !== sessionId));

	const handleSessionTerminate = (session: SessionData) => {
		startTransition(async () => {
			try {
				setIsTerminating(session.id);
				const isCurrent = isCurrentSession(session, currentSession);

				if (isCurrent) {
					// For current session, use signOut to properly clear cookies and redirect
					await authClient.signOut({
						fetchOptions: {
							onSuccess: () => {
								toast.success("Signed out successfully");
								window.location.href = link("/sign-in");
							},
							onError: () => {
								toast.error("Failed to sign out");
								setIsTerminating(undefined);
							},
						},
					});
				} else {
					// For other sessions, use revokeSession
					const res = await authClient.revokeSession({
						token: session.token,
					});

					if (res?.error) {
						toast.error(res.error.message || "Failed to revoke session");
					} else {
						toast.success("Session terminated successfully");
						removeActiveSession(session.id);
					}
				}

				setIsTerminating(undefined);
			} catch (error) {
				console.error("Error revoking session:", error);
				toast.error("Failed to terminate session");
				setIsTerminating(undefined);
			}
		});
	};

	return (
		<div className="flex w-max flex-col gap-1 border-l-2 px-2">
			<p className="font-medium text-xs">Active Sessions</p>
			{validSessions.length === 0 ? (
				<p className="text-muted-foreground text-xs">
					No active sessions found.
				</p>
			) : (
				validSessions.map((session) => {
					const isCurrent = isCurrentSession(session, currentSession);

					return (
						<div key={session.id}>
							<div className="flex items-center gap-2 font-medium text-black text-sm dark:text-white">
								{getDeviceIcon(session.userAgent)}
								{getDeviceInfo(session.userAgent)}
								{isCurrent && (
									<Badge variant="default" className="text-xs">
										Current
									</Badge>
								)}
								<Button
									type="button"
									variant="link"
									size="sm"
									className="text-red-500 text-xs"
									onClick={() => handleSessionTerminate(session)}
									disabled={isPending}
								>
									{isTerminating === session.id ? (
										<Loader2 size={15} className="animate-spin" />
									) : isCurrent ? (
										"Sign Out"
									) : (
										"Terminate"
									)}
								</Button>
							</div>
						</div>
					);
				})
			)}
		</div>
	);
}
