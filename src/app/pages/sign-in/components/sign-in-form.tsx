"use client";

import { useForm } from "@tanstack/react-form";
import { ExternalLink } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/app/components/ui/button";
import {
	FormControl,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/app/components/ui/input-otp";
import { SocialSignInButton } from "@/app/pages/sign-in/components/social-sign-in-button";
import { setupAuthClient } from "@/lib/auth/auth-client";
import {
	SIGN_IN_FORM,
	SOCIAL_PROVIDERS,
	type SocialProvider,
} from "@/lib/utils/constants";
import { FieldErrors } from "@/lib/utils/form";
import { link } from "@/lib/utils/links";
import { signInEmailSchema, signInOtpSchema } from "@/lib/validators/auth";

interface SignInFormProps {
	authUrl: string;
}

export function SignInForm({ authUrl }: SignInFormProps) {
	const [isPending, startTransition] = useTransition();
	const [showOtpInput, setShowOtpInput] = useState(false);
	const [result, setResult] = useState("");
	const [socialProvider, setSocialProvider] = useState<SocialProvider | null>(
		null,
	);

	const authClient = setupAuthClient(authUrl);

	// Email form for step 1
	const emailForm = useForm({
		defaultValues: {
			email: "",
		},
		validators: {
			onChange: signInEmailSchema,
		},
		onSubmit: async ({ value }) => {
			startTransition(() => {
				authClient.emailOtp.sendVerificationOtp(
					{
						email: value.email,
						type: "sign-in",
					},
					{
						onRequest: () =>
							setResult(SIGN_IN_FORM.LOADING_MESSAGES.SENDING_OTP),
						onSuccess: () => {
							setShowOtpInput(true);
							setResult(SIGN_IN_FORM.SUCCESS_MESSAGES.OTP_SENT);
							// Set the email in the OTP form
							otpForm.setFieldValue("email", value.email);
						},
						onError: (ctx) => {
							setResult(`Error: ${ctx.error.message}`);
						},
					},
				);
			});
		},
	});

	// OTP form for step 2
	const otpForm = useForm({
		defaultValues: {
			email: "",
			otp: "",
		},
		validators: {
			onChange: signInOtpSchema,
		},
		onSubmit: async ({ value }) => {
			startTransition(() => {
				authClient.signIn.emailOtp(
					{
						email: value.email,
						otp: value.otp,
					},
					{
						onRequest: () =>
							setResult(SIGN_IN_FORM.LOADING_MESSAGES.VERIFYING_OTP),
						onSuccess: () => {
							window.location.href = link("/guestbook");
						},
						onError: (ctx) => {
							setResult(`Error: ${ctx.error.message}`);
						},
					},
				);
			});
		},
	});

	const handleBackToEmail = () => {
		setShowOtpInput(false);
		setResult("");
		otpForm.reset();
	};

	const handleSocialSignIn = (provider: SocialProvider) => {
		setSocialProvider(provider);
		startTransition(() => {
			authClient.signIn.social({
				provider,
				callbackURL: link("/guestbook"),
			});
		});
	};

	return (
		<div className="mx-auto mt-10 w-full max-w-md p-6">
			<h1 className="mb-2 text-center font-bold text-3xl">Welcome ☁️</h1>
			<p className="mb-6 text-center text-muted-foreground">
				{!showOtpInput ? (
					"Choose a sign in method below."
				) : (
					<>
						We've sent a verification code to{" "}
						<span className="font-medium">
							{otpForm.getFieldValue("email")}
						</span>
						.
					</>
				)}
			</p>

			{!showOtpInput ? (
				<>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							emailForm.handleSubmit();
						}}
					>
						<div className="space-y-4">
							<emailForm.Field name="email">
								{(field) => (
									<FormItem>
										<FormLabel htmlFor={field.name}>Email</FormLabel>
										<FormControl>
											<Input
												id={field.name}
												name={field.name}
												type="email"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
												placeholder="you@example.com"
												autoComplete="email"
												disabled={isPending}
											/>
										</FormControl>
										<FieldErrors errors={field.state.meta.errors} />
									</FormItem>
								)}
							</emailForm.Field>

							{result && (
								<FormMessage
									variant={result.includes("Error") ? "destructive" : "success"}
								>
									{result}
								</FormMessage>
							)}

							<emailForm.Subscribe selector={(state) => [state.canSubmit]}>
								{([canSubmit]) => (
									<Button
										type="submit"
										disabled={!canSubmit || isPending}
										className="w-full"
									>
										{isPending
											? SIGN_IN_FORM.LOADING_MESSAGES.SENDING_OTP
											: "Send verification code"}
									</Button>
								)}
							</emailForm.Subscribe>
						</div>
					</form>

					<div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-gray-300 border-t dark:border-gray-600" />
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="bg-background px-2 text-gray-500 dark:text-gray-400">
								Or continue with
							</span>
						</div>
					</div>

					<div className="space-y-4">
						<SocialSignInButton
							provider={SOCIAL_PROVIDERS.GOOGLE}
							onClick={handleSocialSignIn}
							disabled={isPending}
							isLoading={socialProvider !== null}
							currentProvider={socialProvider}
						/>

						<SocialSignInButton
							provider={SOCIAL_PROVIDERS.GITHUB}
							onClick={handleSocialSignIn}
							disabled={isPending}
							isLoading={socialProvider !== null}
							currentProvider={socialProvider}
						/>
					</div>
				</>
			) : (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						otpForm.handleSubmit();
					}}
				>
					<div className="space-y-4">
						<otpForm.Field name="otp">
							{(field) => (
								<FormItem>
									<FormLabel htmlFor={field.name}>Verification Code</FormLabel>
									<FormControl>
										<InputOTP
											id={field.name}
											name={field.name}
											value={field.state.value}
											onChange={field.handleChange}
											onBlur={field.handleBlur}
											disabled={isPending}
											autoComplete="one-time-code"
											maxLength={SIGN_IN_FORM.OTP_LENGTH}
											className="w-full"
										>
											<InputOTPGroup className="w-full justify-between gap-2">
												{Array.from(
													{ length: SIGN_IN_FORM.OTP_LENGTH },
													(_, index) => (
														<InputOTPSlot
															// biome-ignore lint/suspicious/noArrayIndexKey: Index is stable for OTP slots
															key={`otp-slot-${index}`}
															index={index}
															className="h-12 flex-1 rounded-md border border-input text-xl"
														/>
													),
												)}
											</InputOTPGroup>
										</InputOTP>
									</FormControl>
									<FieldErrors errors={field.state.meta.errors} />
								</FormItem>
							)}
						</otpForm.Field>

						{result && (
							<FormMessage
								variant={result.includes("Error") ? "destructive" : "success"}
							>
								{result}
							</FormMessage>
						)}

						<otpForm.Subscribe selector={(state) => [state.canSubmit]}>
							{([canSubmit]) => (
								<Button
									type="submit"
									disabled={!canSubmit || isPending}
									className="w-full"
								>
									{isPending
										? SIGN_IN_FORM.LOADING_MESSAGES.VERIFYING_OTP
										: "Verify & Sign In"}
								</Button>
							)}
						</otpForm.Subscribe>

						<Button
							type="button"
							variant="link"
							className="w-full"
							onClick={handleBackToEmail}
							disabled={isPending}
						>
							Back to Email
						</Button>
					</div>
				</form>
			)}

			<div className="mt-8 text-center text-muted-foreground text-sm italic">
				Authentication powered by{" "}
				<a
					href="https://better-auth.com"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1 text-muted-foreground underline hover:text-muted-foreground/80"
				>
					Better Auth
					<ExternalLink className="h-3 w-3" />
				</a>
				<br />
				and Cloudflare D1+KV
			</div>
		</div>
	);
}
