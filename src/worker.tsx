import { env } from "cloudflare:workers";

import { realtimeRoute } from "rwsdk/realtime/worker";
import { layout, render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { apiRoutes } from "@/api/routes";
import { Document } from "@/app/document/Document";
import { setCommonHeaders } from "@/app/document/headers";
import { AppLayout } from "@/app/layouts/app-layout";
import { GuestbookPage } from "@/app/pages/guestbook/guestbook-page";
import { Landing } from "@/app/pages/landing";
import { NotFound } from "@/app/pages/not-found";
import { ProfilePage } from "@/app/pages/profile/profile-page";
import { SignIn } from "@/app/pages/sign-in/sign-in-page";
import { TasksPage } from "@/app/pages/tasks/tasks-page";
import { appMiddleware } from "@/middleware/app-middleware";
import { redirectIfAuth, requireAuth } from "@/middleware/auth-interruptors";

export { RealtimeDurableObject } from "rwsdk/realtime/durableObject";

export default defineApp([
	realtimeRoute(() => env.REALTIME_DURABLE_OBJECT),

	setCommonHeaders(),

	appMiddleware,

	apiRoutes,

	render(Document, [
		layout(AppLayout, [
			route("/", Landing),
			route("/sign-in", [redirectIfAuth, SignIn]),
			route("/guestbook", [requireAuth, GuestbookPage]),
			route("/tasks", [requireAuth, TasksPage]),
			route("/profile", [requireAuth, ProfilePage]),
		]),
		route("*", NotFound),
	]),
]);
