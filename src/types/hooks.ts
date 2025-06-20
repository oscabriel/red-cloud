import type { SocialProvider } from "@/lib/utils/constants";

export interface UseSignInFormProps {
	authUrl: string;
}

export interface UseSignInFormReturn {
	// Form state
	email: string;
	setEmail: (email: string) => void;
	otp: string;
	setOtp: (otp: string) => void;
	result: string;
	showOtpInput: boolean;
	emailError: string;
	otpError: string;
	isPending: boolean;
	socialProvider: SocialProvider | null;

	// Form handlers
	handleSendOtp: (e: React.FormEvent) => void;
	handleVerifyOtp: (e: React.FormEvent) => void;
	handleBackToEmail: () => void;
	handleSocialSignIn: (provider: SocialProvider) => void;

	// Validation functions
	validateEmail: (email: string) => string;
	validateOtp: (otp: string) => string;
}
