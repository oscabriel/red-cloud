import { useMemo } from "react";

import { EditProfileDialog } from "./edit-profile-dialog";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/app/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils/user";

// Define ProfileInfoProps interface
interface ProfileInfoProps {
	user: {
		id: string;
		name: string | null;
		email: string;
		emailVerified: boolean | null;
		image: string | null;
		createdAt: Date | null;
		updatedAt: Date | null;
	};
}

function getInitials(name: string | null, email: string): string {
	if (name) {
		return name
			.split(" ")
			.map((part) => part.charAt(0))
			.join("")
			.toUpperCase()
			.slice(0, 2);
	}
	return email.charAt(0).toUpperCase();
}

export function ProfileInfo({ user }: ProfileInfoProps) {
	const initials = useMemo(
		() => getInitials(user.name, user.email),
		[user.name, user.email],
	);
	const avatarUrl = useMemo(() => getAvatarUrl(user.image), [user.image]);

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Header with User Info and Edit Button */}
			<div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
				<div className="space-y-3 sm:space-y-4">
					{/* User Profile Section */}
					<div className="flex items-center space-x-3 sm:space-x-4">
						<Avatar className="h-12 w-12 sm:h-16 sm:w-16">
							<AvatarImage
								src={avatarUrl || undefined}
								alt={user.name || "User avatar"}
							/>
							<AvatarFallback className="text-sm sm:text-lg">
								{initials}
							</AvatarFallback>
						</Avatar>

						<div className="space-y-1">
							<h2 className="font-bold text-lg sm:text-xl">
								{user.name || "No name set"}
							</h2>
							<p className="text-muted-foreground text-xs sm:text-sm">
								{user.email}
							</p>
						</div>
					</div>
				</div>

				{/* Edit Button */}
				<div className="flex justify-center sm:justify-start">
					<EditProfileDialog user={user} />
				</div>
			</div>
		</div>
	);
}
