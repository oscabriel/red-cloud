/**
 * TypeScript interfaces for server function input parameters
 * These types ensure compatibility with TanStack Form plain object submissions
 */

// Guestbook server function types
export interface CreateGuestbookMessageInput {
	name: string;
	message: string;
	country: string;
}

export interface CompleteOnboardingInput {
	name: string;
}

// Profile server function types
export interface UpdateProfileInput {
	name: string;
}

export interface UploadAvatarInput {
	fileBase64: string;
	fileName: string;
	fileType: string;
	fileSize: number;
}

// Common server function response types
export interface ServerFunctionSuccess<T = unknown> {
	success: true;
	message: string;
	data?: T;
	avatarUrl?: string; // For avatar upload responses
}
export interface ServerFunctionError {
	success: false;
	error: string;
	issues?: Array<{
		field: string;
		message: string;
	}>;
}

export type ServerFunctionResponse<T = unknown> =
	| ServerFunctionSuccess<T>
	| ServerFunctionError;

// Session management types
export interface RevokeSessionInput {
	sessionToken: string;
}

export interface SessionData {
	id: string;
	userId: string;
	token: string;
	userAgent?: string;
	ipAddress?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ListSessionsResponse
	extends ServerFunctionSuccess<SessionData[]> {
	sessions: SessionData[];
}
