"use client";

import { UserCircle } from "lucide-react";
import { useState } from "react";

import { LogoutButton } from "@/app/components/navigation/sign-out-button";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
	getAvatarUrl,
	getUserDisplayName,
	getUserInitials,
} from "@/lib/utils/user";
import type { AppContext } from "@/types/app";

interface UserMenuProps {
	ctx: AppContext;
}

export function UserMenu({ ctx }: UserMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	// Use user from context (populated by better-auth middleware)
	const currentUser = ctx.user;

	if (!currentUser) {
		return (
			<Button variant="outline" size="sm" className="h-9 px-3" asChild>
				<a href="/sign-in">Sign In</a>
			</Button>
		);
	}

	const avatarUrl = getAvatarUrl(currentUser.image ?? null);
	const displayName = getUserDisplayName(currentUser);
	const initials = getUserInitials(currentUser);

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="h-9 px-3">
					Account
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56 rounded-lg" align="end">
				<DropdownMenuLabel className="p-0 font-normal">
					<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<Avatar className="h-7 w-7 rounded-lg">
							<AvatarImage src={avatarUrl || ""} alt={displayName} />
							<AvatarFallback className="rounded-lg text-xs">
								{initials}
							</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium text-sm">
								{displayName}
							</span>
							<span className="truncate text-muted-foreground text-xs">
								{currentUser.email}
							</span>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild className="text-sm">
						<a href="/profile" onClick={() => setIsOpen(false)}>
							<UserCircle className="mr-2 h-4 w-4" />
							Profile
						</a>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="p-0">
					<LogoutButton authUrl={ctx.authUrl} />
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
