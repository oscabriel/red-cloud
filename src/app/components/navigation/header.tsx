"use client";

import { ChevronDown, ExternalLink } from "lucide-react";
import { useState } from "react";

import { ModeToggle } from "@/app/components/navigation/mode-toggle";
import { UserMenu } from "@/app/components/navigation/user-menu";
import { Button } from "@/app/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import type { AppContext } from "@/types/app";

interface HeaderProps {
	ctx: AppContext;
}

export function Header({ ctx }: HeaderProps) {
	const [isOpen, setIsOpen] = useState(false);

	const navLinks = [
		...(ctx.user
			? [
					{ href: "/tasks", label: "Tasks" },
					{ href: "/guestbook", label: "Guestbook" },
				]
			: []),
		{
			href: "https://github.com/oscabriel/red-cloud",
			label: "Source",
			external: true,
		},
	];

	return (
		<div className="flex items-center justify-between">
			{/* Navigation Links */}
			<nav className="flex items-center">
				{/* Desktop Navigation */}
				<div className="hidden items-center gap-2 md:flex">
					{navLinks.map(({ href, label, external }) => (
						<Button
							key={href}
							variant="ghost"
							size="sm"
							className="h-9 px-3 transition-colors hover:bg-accent hover:text-accent-foreground"
							asChild
						>
							{external ? (
								<a
									href={href}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center"
								>
									{label}
									<ExternalLink className="h-3.5 w-3.5" />
								</a>
							) : (
								<a href={href}>{label}</a>
							)}
						</Button>
					))}
				</div>

				{/* Mobile Navigation Menu */}
				<div className="md:hidden">
					<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="flex h-9 items-center gap-1.5 px-3"
							>
								Menu
								<ChevronDown
									className={`h-3.5 w-3.5 transition-transform duration-200 ${
										isOpen ? "rotate-180" : ""
									}`}
								/>
								<span className="sr-only">Open menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start" className="w-48">
							{navLinks.map(({ href, label, external }) => (
								<DropdownMenuItem key={href} asChild>
									{external ? (
										<a
											href={href}
											target="_blank"
											rel="noopener noreferrer"
											className="flex w-full items-center gap-2 text-sm"
										>
											{label}
											<ExternalLink className="h-3.5 w-3.5" />
										</a>
									) : (
										<a href={href} className="w-full text-sm">
											{label}
										</a>
									)}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</nav>

			{/* Right Side Controls */}
			<div className="flex items-center gap-3 pl-2">
				<ModeToggle />
				<UserMenu ctx={ctx} />
			</div>
		</div>
	);
}
