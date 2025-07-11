import alchemy from "alchemy";
import {
	D1Database,
	DurableObjectNamespace,
	R2Bucket,
	Website,
} from "alchemy/cloudflare";

const APP_NAME = "red-cloud";

const app = await alchemy(APP_NAME, {
	phase: process.argv.includes("destroy") ? "destroy" : "up",
	stage: process.env.ALCHEMY_STAGE || "dev",
	quiet: process.argv.includes("--quiet"),
	password: process.env.SECRET_ALCHEMY_PASSPHRASE,
});

const db = await D1Database("db", {
	name: `${APP_NAME}-db`,
	adopt: true,
	migrationsDir: "src/db/migrations",
	primaryLocationHint: "wnam",
	readReplication: {
		mode: "auto",
	},
});

const avatarsBucket = await R2Bucket("avatars", {
	name: `${APP_NAME}-avatars`,
	adopt: true,
});

const realtimeDurableObject = new DurableObjectNamespace("realtime", {
	className: "RealtimeDurableObject",
});

export const site = await Website("site", {
	name: `${APP_NAME}`,
	command: "bun clean && bun run build",
	main: "dist/worker/worker.js",
	assets: "dist/client",
	wrangler: {
		main: "src/worker.tsx",
	},
	compatibilityFlags: ["nodejs_compat"],
	compatibilityDate: "2025-06-17",
	observability: {
		enabled: true,
	},
	bindings: {
		DB: db,
		AVATARS_BUCKET: avatarsBucket,
		REALTIME_DURABLE_OBJECT: realtimeDurableObject,
		BETTER_AUTH_SECRET: alchemy.secret(process.env.BETTER_AUTH_SECRET),
		RESEND_API_KEY: alchemy.secret(process.env.RESEND_API_KEY),
		GOOGLE_CLIENT_ID: alchemy.secret(process.env.GOOGLE_CLIENT_ID),
		GOOGLE_CLIENT_SECRET: alchemy.secret(process.env.GOOGLE_CLIENT_SECRET),
		GITHUB_CLIENT_ID: alchemy.secret(process.env.GITHUB_CLIENT_ID),
		GITHUB_CLIENT_SECRET: alchemy.secret(process.env.GITHUB_CLIENT_SECRET),
		CLOUDFLARE_ACCOUNT_ID: alchemy.secret(process.env.CLOUDFLARE_ACCOUNT_ID),
		CLOUDFLARE_DATABASE_ID: alchemy.secret(process.env.CLOUDFLARE_DATABASE_ID),
		CLOUDFLARE_API_TOKEN: alchemy.secret(process.env.CLOUDFLARE_API_TOKEN),
	},
});

console.log(`➜  Cloudflare:   ${site.url}`);

await app.finalize();
