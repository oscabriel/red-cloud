import type { LayoutProps } from "rwsdk/router";

import { Header } from "@/app/components/navigation/header";
import { OnboardingDialog } from "@/app/pages/guestbook/components/onboarding-dialog";
import { ClientProviders } from "@/app/providers/client-providers";
import { link } from "@/lib/utils/links";

export function AppLayout({ children, requestInfo }: LayoutProps) {
	const ctx = requestInfo?.ctx;

	return (
		<ClientProviders>
			<div className="min-h-screen bg-background">
				<header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 dark:bg-background/50">
					<div className="container mx-auto flex h-16 items-center justify-between px-6">
						<a href={link("/")} className="font-semibold text-3xl">
							☁️
						</a>
						{requestInfo && <Header ctx={requestInfo.ctx} />}
					</div>
				</header>
				<main className="container mx-auto px-6 py-8">{children}</main>

				{/* Onboarding Dialog */}
				{ctx?.needsOnboarding && ctx.user && (
					<OnboardingDialog isOpen={true} userEmail={ctx.user.email} />
				)}
			</div>
		</ClientProviders>
	);
}
