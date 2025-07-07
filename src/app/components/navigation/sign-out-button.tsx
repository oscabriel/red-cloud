"use client";

import { LogOutIcon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/app/components/ui/button";
import { setupAuthClient } from "@/lib/auth/auth-client";
import { link } from "@/lib/utils/links";

interface SignOutButtonProps {
	className?: string;
	authUrl: string;
	variant?: "ghost" | "outline";
}

export function SignOutButton({
	className,
	authUrl,
	variant = "ghost",
}: SignOutButtonProps) {
	const [isPending, startTransition] = useTransition();
	const authClient = setupAuthClient(authUrl);

	const handleSignOut = () => {
		startTransition(async () => {
			try {
				const { error } = await authClient.signOut();

				if (error) {
					console.error("Error signing out:", error);
					toast.error("Failed to sign out");
				} else {
					toast.success("Signed out successfully");
					window.location.href = link("/sign-in");
				}
			} catch (error) {
				console.error("Error signing out:", error);
				toast.error("Failed to sign out");
			}
		});
	};

	return (
		<Button
			variant={variant}
			onClick={handleSignOut}
			disabled={isPending}
			className={className}
		>
			<LogOutIcon className="mr-2 size-4" />
			{isPending ? "Signing out..." : "Sign Out"}
		</Button>
	);
}
