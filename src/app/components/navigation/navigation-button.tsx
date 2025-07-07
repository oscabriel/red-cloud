// An issue with client-side navigation requires a separate button component for the landing page

"use client";

import { Button } from "../ui/button";

interface NavigationButtonProps {
	href: string;
	children: React.ReactNode;
	className?: string;
}

export function NavigationButton({
	href,
	children,
	className = "",
}: NavigationButtonProps) {
	return (
		<Button
			variant="outline"
			className={`px-6 py-4 text-base hover:bg-background/90 sm:px-8 sm:py-6 sm:text-lg ${className}`}
			onClick={() => {
				window.location.href = href;
			}}
		>
			{children}
		</Button>
	);
}
