import { z } from "zod";

import { FILE_UPLOAD } from "@/lib/utils/constants";

// Validation schema for updating user profile
export const updateProfileSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(50, "Name must be 50 characters or less"),
});

// Validation schema for avatar upload
export const avatarUploadSchema = z.object({
	file: z
		.instanceof(File)
		.refine(
			(file) => file.size <= FILE_UPLOAD.MAX_SIZE_BYTES,
			"File size must be less than 5MB",
		)
		.refine(
			(file) =>
				(FILE_UPLOAD.ALLOWED_IMAGE_TYPES as readonly string[]).includes(
					file.type,
				),
			"File must be a JPEG, PNG, or WebP image",
		),
});

// Type exports for use in components
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AvatarUploadInput = z.infer<typeof avatarUploadSchema>;
