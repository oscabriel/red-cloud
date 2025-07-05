import { z } from "zod";

// Existing auth schemas
export const signInEmailSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
});

export const signInOtpSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	otp: z.string().length(6, "Verification code must be 6 digits"),
});

// Organization validation schemas
export const organizationRoleSchema = z.enum(["owner", "admin", "member"]);

export const createOrganizationSchema = z.object({
	name: z.string().min(1, "Organization name is required").max(100),
	slug: z.string().min(1).max(50).optional(),
	logo: z.string().url().optional(),
});

export const updateOrganizationSchema = z.object({
	name: z.string().min(1, "Organization name is required").max(100).optional(),
	slug: z.string().min(1).max(50).optional(),
	logo: z.string().url().optional(),
	metadata: z.string().optional(),
});

export const inviteMemberSchema = z.object({
	email: z.string().email("Invalid email address"),
	role: organizationRoleSchema.default("member"),
	organizationId: z.string().optional(), // Optional, defaults to active organization
});

export const updateMemberRoleSchema = z.object({
	memberIdOrEmail: z.string().min(1, "Member ID or email is required"),
	role: organizationRoleSchema,
	organizationId: z.string().optional(),
});

export const invitationStatusSchema = z.enum([
	"pending",
	"accepted",
	"rejected",
	"expired",
]);

export const acceptInvitationSchema = z.object({
	invitationId: z.string().min(1, "Invitation ID is required"),
});

export const cancelInvitationSchema = z.object({
	invitationId: z.string().min(1, "Invitation ID is required"),
});

export const setActiveOrganizationSchema = z.object({
	organizationId: z.string().min(1, "Organization ID is required"),
});

// Type exports
export type SignInEmailInput = z.infer<typeof signInEmailSchema>;
export type SignInOtpInput = z.infer<typeof signInOtpSchema>;
export type OrganizationRole = z.infer<typeof organizationRoleSchema>;
export type InvitationStatus = z.infer<typeof invitationStatusSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
export type SetActiveOrganizationInput = z.infer<
	typeof setActiveOrganizationSchema
>;
