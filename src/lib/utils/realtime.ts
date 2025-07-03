"use server";

import { env } from "cloudflare:workers";

import { renderRealtimeClients } from "rwsdk/realtime/worker";

/**
 * Utility function to trigger realtime updates for connected clients
 * Centralizes realtime update logic and reduces code duplication
 */
export async function triggerRealtimeUpdate(key: string): Promise<void> {
	try {
		await renderRealtimeClients({
			durableObjectNamespace: env.REALTIME_DURABLE_OBJECT,
			key,
		});
	} catch (error) {
		// Log error but don't throw - realtime updates should not break the main flow
		console.error(`Failed to trigger realtime update for key: ${key}`, error);
	}
}

/**
 * Common realtime update keys used across the application
 * Centralizes key management and prevents typos
 */
export const REALTIME_KEYS = {
	GUESTBOOK: "/guestbook",
	PROFILE: "/profile",
	TASKS: "/tasks",
} as const;
