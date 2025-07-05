import type { auth } from "@/lib/auth";

// Better Auth server types - using $Infer.Session which contains both session and user
export type Session = typeof auth.$Infer.Session;

// Extract user type from the session type
export type User = Session["user"];

// Extract session data type (without user)
export type SessionData = Session["session"];

// Organization types - defined manually based on our schema
export type Organization = {
	id: string;
	name: string;
	slug?: string;
	logo?: string;
	createdAt: Date;
	metadata?: string;
};

export type Member = {
	id: string;
	organizationId: string;
	userId: string;
	role: OrganizationRole;
	createdAt: Date;
};

export type Invitation = {
	id: string;
	organizationId: string;
	email: string;
	role?: string;
	status: InvitationStatus;
	expiresAt: Date;
	inviterId: string;
};

// Manual type definitions based on our schema
export type OrganizationRole = "owner" | "admin" | "member";
export type InvitationStatus = "pending" | "accepted" | "rejected" | "expired";

// Session with organization context
export type SessionWithOrganization = Session & {
	session: SessionData & {
		activeOrganizationId?: string;
	};
};

// User with organization memberships
export type UserWithMemberships = User & {
	memberships?: Member[];
};

// Organization with member count
export type OrganizationWithMembers = {
	id: string;
	name: string;
	slug?: string;
	logo?: string;
	createdAt: Date;
	metadata?: string;
	members?: Member[];
	memberCount?: number;
};

// Invitation with organization and inviter details
export type InvitationWithDetails = {
	id: string;
	organizationId: string;
	email: string;
	role?: string;
	status: InvitationStatus;
	expiresAt: Date;
	inviterId: string;
	organization?: OrganizationWithMembers;
	inviter?: User;
};

// Member type
export type MemberWithDetails = {
	id: string;
	organizationId: string;
	userId: string;
	role: OrganizationRole;
	createdAt: Date;
	user?: User;
	organization?: OrganizationWithMembers;
};

// Active organization type (from client)
export type ActiveOrganization = OrganizationWithMembers;
