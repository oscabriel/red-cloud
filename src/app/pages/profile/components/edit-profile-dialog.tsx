"use client";

import { useForm } from "@tanstack/react-form";
import { Pencil, Trash2, Upload } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/app/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
	removeAvatar,
	updateProfile,
	uploadAvatar,
} from "@/app/pages/profile/functions";
import { FILE_UPLOAD } from "@/lib/utils/constants";
import {
	createFileFieldValue,
	FieldErrors,
	fileValidators,
} from "@/lib/utils/form";
import { updateProfileSchema } from "@/lib/validators/profile";

interface EditProfileDialogProps {
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

export function EditProfileDialog({ user }: EditProfileDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Profile form for name editing
	const profileForm = useForm({
		defaultValues: {
			name: user.name || "",
		},
		validators: {
			onChange: updateProfileSchema,
		},
		onSubmit: async ({ value }) => {
			startTransition(async () => {
				const result = await updateProfile(value);

				if (result.success) {
					toast.success(result.message);
					setIsOpen(false);
					// Realtime update will be triggered automatically by server function
				} else {
					toast.error(result.error);

					if (result.issues) {
						for (const issue of result.issues) {
							toast.error(`${issue.field}: ${issue.message}`);
						}
					}
				}
			});
		},
	});

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Client-side validation using form validators
		const sizeValidation = fileValidators.maxSize(FILE_UPLOAD.MAX_SIZE_MB)(
			file,
		);
		if (sizeValidation) {
			toast.error(sizeValidation);
			return;
		}

		const typeValidation = fileValidators.allowedTypes(
			FILE_UPLOAD.ALLOWED_IMAGE_TYPES,
		)(file);
		if (typeValidation) {
			toast.error(typeValidation);
			return;
		}

		try {
			// Convert File to base64 for rwsdk compatibility (JSON serializable)
			const fileValue = await createFileFieldValue(file);

			const data = {
				fileBase64: fileValue.base64?.split(",")[1] || "", // Remove data URL prefix
				fileName: file.name,
				fileType: file.type,
				fileSize: file.size,
			};

			startTransition(async () => {
				const result = await uploadAvatar(data);

				if (result.success) {
					toast.success(result.message);
					setIsOpen(false);
					// Realtime update will be triggered automatically by server function
				} else {
					toast.error(result.error);
				}
			});
		} catch (error) {
			console.error("File processing error:", error);
			toast.error("Failed to process file");
		}

		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleRemoveAvatar = () => {
		if (!confirm("Are you sure you want to remove your avatar?")) {
			return;
		}

		startTransition(async () => {
			const result = await removeAvatar();

			if (result.success) {
				toast.success(result.message);
				setIsOpen(false);
				// Realtime update will be triggered automatically by server function
			} else {
				toast.error(result.error);
			}
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="flex w-full items-center justify-center space-x-2 text-sm sm:w-auto"
				>
					<Pencil className="h-4 w-4" />
					<span>Edit Profile</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit Profile</DialogTitle>
				</DialogHeader>
				<div className="space-y-6">
					{/* Avatar Management */}
					<div className="space-y-4">
						<Label>Profile Picture</Label>
						<div className="flex space-x-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => fileInputRef.current?.click()}
								disabled={isPending}
								className="flex items-center space-x-2"
							>
								<Upload className="h-4 w-4" />
								<span>{user.image ? "Change" : "Upload"}</span>
							</Button>

							{user.image && (
								<Button
									variant="outline"
									size="sm"
									onClick={handleRemoveAvatar}
									disabled={isPending}
									className="flex items-center space-x-2"
								>
									<Trash2 className="h-4 w-4" />
									<span>Remove</span>
								</Button>
							)}

							<Input
								ref={fileInputRef}
								type="file"
								accept={FILE_UPLOAD.ALLOWED_IMAGE_TYPES.join(",")}
								onChange={handleFileUpload}
								className="hidden"
								disabled={isPending}
							/>
						</div>
					</div>

					{/* Name Form using TanStack Form */}
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							profileForm.handleSubmit();
						}}
						className="space-y-4"
					>
						<profileForm.Field name="name">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Display Name</Label>
									<Input
										id={field.name}
										name={field.name}
										type="text"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										placeholder="Enter your display name"
										disabled={isPending}
										autoComplete="name"
									/>
									<FieldErrors errors={field.state.meta.errors} />
								</div>
							)}
						</profileForm.Field>

						<div className="flex justify-end space-x-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsOpen(false)}
								disabled={isPending}
							>
								Cancel
							</Button>

							<profileForm.Subscribe selector={(state) => [state.canSubmit]}>
								{([canSubmit]) => (
									<Button type="submit" disabled={!canSubmit || isPending}>
										{isPending ? "Saving..." : "Save Changes"}
									</Button>
								)}
							</profileForm.Subscribe>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
