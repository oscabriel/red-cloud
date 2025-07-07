"use client";

import { useForm } from "@tanstack/react-form";
import { useTransition } from "react";

import { Button } from "@/app/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { completeOnboarding } from "@/app/pages/guestbook/functions";
import { FieldErrors } from "@/lib/utils/form";
import { completeOnboardingSchema } from "@/lib/validators/guestbook";

interface OnboardingDialogProps {
	isOpen: boolean;
	userEmail: string;
}

export function OnboardingDialog({ isOpen, userEmail }: OnboardingDialogProps) {
	const [isPending, startTransition] = useTransition();

	const form = useForm({
		defaultValues: {
			name: "",
		},
		validators: {
			onChange: completeOnboardingSchema,
		},
		onSubmit: async ({ value }) => {
			startTransition(async () => {
				try {
					const result = await completeOnboarding(value);

					if (!result.success) {
						// Error handling is shown through field validation client-side
						// but we can also log server errors.
						console.error("Onboarding failed:", result.error);
					}
				} catch (error) {
					console.error("Onboarding error:", error);
				}
			});
		},
	});

	return (
		<Dialog open={isOpen}>
			<DialogContent className="sm:max-w-md" showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>Complete Your Profile</DialogTitle>
					<DialogDescription>
						Welcome! Please complete your profile to continue using the app.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							value={userEmail}
							disabled
							className="bg-muted"
							autoComplete="email"
						/>
					</div>

					<form.Field name="name">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Full Name *</Label>
								<Input
									id={field.name}
									name={field.name}
									type="text"
									placeholder="Enter your full name"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									disabled={isPending}
									required
									autoComplete="name"
								/>
								<FieldErrors errors={field.state.meta.errors} />
							</div>
						)}
					</form.Field>

					<form.Subscribe selector={(state) => [state.canSubmit]}>
						{([canSubmit]) => (
							<Button
								type="submit"
								className="w-full"
								disabled={!canSubmit || isPending}
							>
								{isPending ? "Saving..." : "Complete Profile"}
							</Button>
						)}
					</form.Subscribe>
				</form>
			</DialogContent>
		</Dialog>
	);
}
