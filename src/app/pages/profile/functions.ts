"use server";

import { env } from "cloudflare:workers";

import { eq } from "drizzle-orm";
import { requestInfo } from "rwsdk/worker";

import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import { auth } from "@/lib/auth";
import { DB_LIMITS, FILE_UPLOAD } from "@/lib/utils/constants";
import { REALTIME_KEYS, triggerRealtimeUpdate } from "@/lib/utils/realtime";
import { updateProfileSchema } from "@/lib/validators/profile";
import type {
	ServerFunctionResponse,
	UpdateProfileInput,
	UploadAvatarInput,
} from "@/types/server-functions";

export async function getUserProfile(userId: string) {
	try {
		const userRecord = await db
			.select()
			.from(user)
			.where(eq(user.id, userId))
			.limit(DB_LIMITS.USER_LOOKUP);

		if (userRecord.length === 0) {
			throw new Error("User not found");
		}

		return userRecord[0];
	} catch {
		throw new Error("Failed to fetch user profile");
	}
}

// Server Functions
export async function updateProfile(
	data: UpdateProfileInput,
): Promise<ServerFunctionResponse> {
	try {
		const { ctx } = requestInfo;

		if (!ctx.user) {
			return {
				success: false,
				error: "Authentication required",
			};
		}

		// Extract data
		const name = data.name;

		// Validate form data using Zod schema
		const validation = updateProfileSchema.safeParse({ name });
		if (!validation.success) {
			return {
				success: false,
				error: "Please check your input",
				issues: validation.error.issues.map((issue) => ({
					field: issue.path.join("."),
					message: issue.message,
				})),
			};
		}

		// Update user record in database
		await db
			.update(user)
			.set({
				name: validation.data.name,
				updatedAt: new Date(),
			})
			.where(eq(user.id, ctx.user.id));

		// Fetch updated user data
		const [_updatedUser] = await db
			.select()
			.from(user)
			.where(eq(user.id, ctx.user.id))
			.limit(DB_LIMITS.USER_LOOKUP);

		// Trigger realtime updates for profile page
		await triggerRealtimeUpdate(REALTIME_KEYS.PROFILE);

		// Return structured success response
		return {
			success: true,
			message: "Profile updated successfully",
		};
	} catch (error) {
		// Add comprehensive error handling
		console.error("Profile update error:", error);
		return {
			success: false,
			error: "Unable to update profile. Please try again.",
		};
	}
}

export async function uploadAvatar(
	data: UploadAvatarInput,
): Promise<ServerFunctionResponse<{ avatarUrl: string }>> {
	try {
		const { ctx } = requestInfo;

		if (!ctx.user) {
			return {
				success: false,
				error: "Authentication required",
			};
		}

		// Extract file data
		const { fileBase64, fileName, fileType, fileSize } = data;

		if (!fileBase64) {
			return {
				success: false,
				error: "No file provided",
			};
		}

		// Validate file data manually (since we can't use Zod with ArrayBuffer)
		if (fileSize > FILE_UPLOAD.MAX_SIZE_BYTES) {
			return {
				success: false,
				error: "File size must be less than 5MB",
			};
		}

		if (!["image/jpeg", "image/png", "image/webp"].includes(fileType)) {
			return {
				success: false,
				error: "File must be a JPEG, PNG, or WebP image",
			};
		}

		// Convert base64 back to ArrayBuffer for R2 upload
		const binaryString = atob(fileBase64);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		const fileBuffer = bytes.buffer;

		// Generate unique filename with timestamp
		const fileExtension = fileName.split(".").pop();
		const uniqueFileName = `avatar-${ctx.user.id}-${Date.now()}.${fileExtension}`;
		const r2ObjectKey = `avatars/${uniqueFileName}`;

		// Upload file to R2 storage
		await env.AVATARS_BUCKET.put(r2ObjectKey, fileBuffer, {
			httpMetadata: {
				contentType: fileType,
			},
		});

		// Update user record with new avatar URL
		await db
			.update(user)
			.set({
				image: r2ObjectKey,
				updatedAt: new Date(),
			})
			.where(eq(user.id, ctx.user.id));

		// Fetch updated user data
		const [_updatedUser] = await db
			.select()
			.from(user)
			.where(eq(user.id, ctx.user.id))
			.limit(DB_LIMITS.USER_LOOKUP);

		// Trigger realtime updates for profile page
		await triggerRealtimeUpdate(REALTIME_KEYS.PROFILE);

		// Return structured success response
		return {
			success: true,
			message: "Avatar updated successfully",
			avatarUrl: r2ObjectKey,
		};
	} catch (error) {
		// Add error handling for R2 operations
		console.error("Avatar upload error:", error);
		return {
			success: false,
			error: "Unable to upload avatar. Please try again.",
		};
	}
}

export async function removeAvatar(): Promise<ServerFunctionResponse> {
	try {
		const { ctx } = requestInfo;

		if (!ctx.user) {
			return {
				success: false,
				error: "Authentication required",
			};
		}

		// Check user authentication
		// Fetch current user data to get existing avatar
		const currentUser = await db
			.select()
			.from(user)
			.where(eq(user.id, ctx.user.id))
			.limit(DB_LIMITS.USER_LOOKUP);

		if (currentUser.length === 0) {
			return {
				success: false,
				error: "User not found",
			};
		}

		const userRecord = currentUser[0];

		// Delete avatar file from R2 storage (only if it's stored in R2, not a social provider URL)
		if (
			userRecord.image &&
			!userRecord.image.startsWith("http://") &&
			!userRecord.image.startsWith("https://")
		) {
			try {
				await env.AVATARS_BUCKET.delete(userRecord.image);
			} catch (error) {
				console.warn("Failed to delete avatar from R2:", error);
				// Continue with database update even if R2 deletion fails
			}
		}

		// Update user record to remove avatar URL
		await db
			.update(user)
			.set({
				image: null,
				updatedAt: new Date(),
			})
			.where(eq(user.id, ctx.user.id));

		// Fetch updated user data
		const [_updatedUser] = await db
			.select()
			.from(user)
			.where(eq(user.id, ctx.user.id))
			.limit(DB_LIMITS.USER_LOOKUP);

		// Trigger realtime updates for profile page
		await triggerRealtimeUpdate(REALTIME_KEYS.PROFILE);

		// Return structured success response
		return {
			success: true,
			message: "Avatar removed successfully",
		};
	} catch (error) {
		// Handle R2 deletion failures gracefully
		console.error("Avatar removal error:", error);
		return {
			success: false,
			error: "Unable to remove avatar. Please try again.",
		};
	}
}

export async function revokeSession(sessionToken: string) {
	try {
		const { ctx, request } = requestInfo;

		if (!ctx.user) {
			return {
				success: false,
				error: "Authentication required",
			};
		}

		// Use the simplified better-auth API
		const result = await auth.api.revokeSession({
			headers: request.headers,
			body: { token: sessionToken },
		});

		if (!result) {
			return {
				success: false,
				error: "Failed to revoke session",
			};
		}

		return {
			success: true,
			message: "Session revoked successfully",
		};
	} catch (error) {
		console.error("Error revoking session:", error);
		return {
			success: false,
			error: "Failed to revoke session",
		};
	}
}

export async function listSessions() {
	try {
		const { ctx, request } = requestInfo;

		if (!ctx.user) {
			return {
				success: false,
				error: "Authentication required",
			};
		}

		// Use the simplified better-auth API
		const sessions = await auth.api.listSessions({
			headers: request.headers,
		});

		if (!Array.isArray(sessions)) {
			return {
				success: false,
				error: "Failed to list sessions",
			};
		}

		return {
			success: true,
			sessions: sessions,
		};
	} catch (error) {
		console.error("Error listing sessions:", error);
		return {
			success: false,
			error: "Failed to list sessions",
		};
	}
}
