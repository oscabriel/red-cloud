import type { User } from "./auth";

/**
 * Application context type that defines the shape of data available
 * throughout the entire application via the ctx parameter.
 */
export type AppContext = {
	user: User | undefined;
	session?: {
		id: string;
		token: string;
		userId: string;
		expiresAt: Date;
		createdAt: Date;
		updatedAt: Date;
		ipAddress?: string | null;
		userAgent?: string | null;
	};
	authUrl: string;
	needsOnboarding?: boolean;
};
