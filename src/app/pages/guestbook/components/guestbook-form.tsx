"use client";

import { useForm } from "@tanstack/react-form";
import { useTransition } from "react";
import type { RequestInfo } from "rwsdk/worker";
import { toast } from "sonner";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/app/components/ui/select";
import { createGuestbookMessage } from "@/app/pages/guestbook/functions";
import { COUNTRIES } from "@/lib/utils/constants";
import { createMessageSchema } from "@/lib/validators/guestbook";

interface GuestbookFormProps {
	user?: RequestInfo["ctx"]["user"];
}

export function GuestbookForm({ user }: GuestbookFormProps) {
	const [isPending, startTransition] = useTransition();
	const currentUser = user;

	// Initialize TanStack Form with client-side validation
	const form = useForm({
		defaultValues: {
			name: currentUser?.name || "",
			message: "",
			country: "",
		},
		onSubmit: async ({ value }) => {
			// Client-side validation before submission
			const validation = createMessageSchema.safeParse(value);
			if (!validation.success) {
				validation.error.errors.forEach((error) => {
					toast.error(`${error.path.join(".")}: ${error.message}`);
				});
				return;
			}

			startTransition(async () => {
				try {
					const result = await createGuestbookMessage(value);

					if (result.success) {
						toast.success(result.message || "Message posted successfully!");
						form.reset();
					} else {
						if (result.issues) {
							// Handle field-specific validation errors
							for (const issue of result.issues) {
								toast.error(`${issue.field}: ${issue.message}`);
							}
						} else {
							toast.error(result.error || "Failed to post message");
						}
					}
				} catch (error) {
					console.error("Form submission error:", error);
					toast.error("An unexpected error occurred");
				}
			});
		},
	});
	return (
		<Card className="bg-background">
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					{/* Name Field */}
					<form.Field name="name">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="name">
									Name{" "}
									{!currentUser && <span className="text-destructive">*</span>}
								</Label>
								<Input
									id="name"
									name="name"
									type="text"
									placeholder={
										currentUser ? currentUser.name || "Your name" : "Your name"
									}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									disabled={!!currentUser || isPending}
									maxLength={30}
									readOnly={!!currentUser}
									autoComplete="name"
								/>
								{!currentUser && (
									<p className="text-muted-foreground text-xs">
										{30 - field.state.value.length} characters remaining
									</p>
								)}
							</div>
						)}
					</form.Field>

					{/* Message Field */}
					<form.Field name="message">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="message">
									Message <span className="text-destructive">*</span>
								</Label>
								<Input
									id="message"
									name="message"
									type="text"
									placeholder="Share your thoughts..."
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									disabled={isPending}
									maxLength={50}
									autoComplete="off"
								/>
								<p className="text-muted-foreground text-xs">
									{50 - field.state.value.length} characters remaining
								</p>
							</div>
						)}
					</form.Field>

					{/* Country Field */}
					<form.Field name="country">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="country">Country (optional)</Label>
								<div className="relative">
									<Select
										value={field.state.value}
										onValueChange={(value) => {
											// Convert "__CLEAR__" value to empty string
											const actualValue = value === "__CLEAR__" ? "" : value;
											field.handleChange(actualValue);
										}}
										disabled={isPending}
									>
										<SelectTrigger id="country">
											<SelectValue placeholder="Select your country" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="__CLEAR__">
												<span className="text-muted-foreground">
													Clear selection
												</span>
											</SelectItem>
											{COUNTRIES.map((country) => (
												<SelectItem key={country} value={country}>
													{country}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						)}
					</form.Field>

					{/* Submit Button */}
					<Button type="submit" disabled={isPending} className="w-full">
						{isPending ? "Posting..." : "Post Message"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
