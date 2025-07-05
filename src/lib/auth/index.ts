import { env } from "cloudflare:workers";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, organization } from "better-auth/plugins";

import { db } from "@/db";
import * as schema from "@/db/schema";
import {
	DeleteAccountEmail,
	VerificationCodeEmail,
	WorkspaceInvitationEmail,
} from "@/lib/auth/email-templates";
import {
	BASE_URL_DEV,
	BASE_URL_PROD,
	EMAIL_FROM_ADDRESS,
	EMAIL_FROM_NAME,
} from "@/lib/utils/constants";
import { sendEmail } from "@/lib/utils/email";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema: schema,
	}),
	secret: env.BETTER_AUTH_SECRET,
	session: {
		storeSessionInDatabase: true,
	},
	user: {
		deleteUser: {
			enabled: true,
			sendDeleteAccountVerification: async ({ user, url, token }) => {
				await sendEmail(
					{
						from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
						to: user.email,
						subject: "Confirm Account Deletion",
						html: DeleteAccountEmail({ url, token }),
					},
					env.RESEND_API_KEY as string,
				);
			},
		},
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
		github: {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET,
		},
	},

	plugins: [
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				if (process.env.NODE_ENV === "development") {
					console.log(`Sending ${type} code to ${email}: ${otp}`);
					return;
				}
				if (type === "sign-in") {
					await sendEmail(
						{
							from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
							to: email,
							subject: "Your Verification Code",
							html: VerificationCodeEmail({ otp }),
						},
						env.RESEND_API_KEY as string,
					);
				}
			},
		}),
		organization({
			allowUserToCreateOrganization: true,
			organizationLimit: 5, // Max 5 workspaces per user
			creatorRole: "owner",
			membershipLimit: 50, // Max 50 members per workspace
			invitationExpiresIn: 48 * 60 * 60, // 48 hours
			sendInvitationEmail: async ({
				email,
				invitation,
				organization,
				inviter,
			}) => {
				const baseUrl =
					process.env.NODE_ENV === "development" ? BASE_URL_DEV : BASE_URL_PROD;
				const invitationUrl = `${baseUrl}/accept-invitation/${invitation.id}`;

				if (process.env.NODE_ENV === "development") {
					console.log(
						`Sending workspace invitation to ${email} for organization ${organization.name}`,
					);
					console.log(`Invitation URL: ${invitationUrl}`);
				}

				await sendEmail(
					{
						from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
						to: email,
						subject: `Invitation to join ${organization.name}`,
						html: WorkspaceInvitationEmail({
							invitationUrl,
							organizationName: organization.name,
							inviterName: inviter.user.name,
							inviterEmail: inviter.user.email,
						}),
					},
					env.RESEND_API_KEY,
				);
			},
		}),
	],
});

/* To use the better-auth cli, you need to use the following auth config,
   commenting out the one above this line. The cli will not work with our actual
	 auth config since we're using our "cloudflare:workers" module.

	 You'll also need to install better-sqlite3 and @types/better-sqlite3:

	 `bun add better-sqlite3 && bun add -D @types/better-sqlite3`

	 Any time you change something in the auth config that requires a new schema,
	 run the following command to generate a new schema file (make sure to add the
	 changes to the config below, too):

	 `bunx @better-auth/cli@latest generate --config src/lib/auth/index.ts --output src/db/schema/auth-schema.ts`
*/

// import { betterAuth } from "better-auth";
// import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { organization } from "better-auth/plugins";
// import Database from "better-sqlite3";
// import { drizzle } from "drizzle-orm/better-sqlite3";

// import * as schema from "../../db/schema";
// import { getLocalSQLiteDBPath } from "../utils/db";

// const sqlite = new Database(getLocalSQLiteDBPath());
// const db = drizzle(sqlite);

// export const auth = betterAuth({
// 	database: drizzleAdapter(db, {
// 		provider: "sqlite",
// 		schema: schema,
// 	}),
// 	plugins: [organization()],
// });
