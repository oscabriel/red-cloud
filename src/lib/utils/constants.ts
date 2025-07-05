export const EMAIL_FROM_NAME = "Red Cloud";
export const EMAIL_FROM_ADDRESS = "noreply@better-cloud.dev";

// Base URL constants for different environments
export const BASE_URL_DEV = "http://localhost:5173";
export const BASE_URL_PROD = "https://red-cloud.oscargabriel.workers.dev";

// Cache refresh time for session data
export const SESSION_CACHE_REFRESH_MS = 30_000; // 30 seconds

// Database query limits
export const DB_LIMITS = {
	GUESTBOOK_MESSAGES: 100, // Limit to prevent performance issues
	USER_LOOKUP: 1, // Single user queries
} as const;

// File upload constraints
export const FILE_UPLOAD = {
	MAX_SIZE_MB: 5,
	MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB in bytes
	ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"] as const,
} as const;

// Common regex patterns used across the application
export const NAME_REGEX = /^[a-zA-Z0-9\s\-_.]+$/;
export const MESSAGE_REGEX = /^[^<>{}]+$/;
export const COUNTRY_REGEX = /^[a-zA-Z\s\-_.]*$/;

// Error messages for regex validation
export const REGEX_ERROR_MESSAGES = {
	NAME: "Name contains invalid characters",
	MESSAGE: "Message contains invalid characters",
	COUNTRY: "Country contains invalid characters",
} as const;

// Social Authentication Providers
export const SOCIAL_PROVIDERS = {
	GOOGLE: "google",
	GITHUB: "github",
} as const;

export type SocialProvider =
	(typeof SOCIAL_PROVIDERS)[keyof typeof SOCIAL_PROVIDERS];

// Sign-in Form Constants
export const SIGN_IN_FORM = {
	OTP_LENGTH: 6,
	EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	VALIDATION_MESSAGES: {
		EMAIL_REQUIRED: "Email is required",
		EMAIL_INVALID: "Please enter a valid email address",
		OTP_REQUIRED: "Verification code is required",
		OTP_INVALID: "Verification code must be 6 digits",
	},
	SUCCESS_MESSAGES: {
		OTP_SENT: "Check your email for the verification code",
		SIGN_IN_SUCCESS: "Sign in successful!",
	},
	LOADING_MESSAGES: {
		SENDING_OTP: "Sending verification code...",
		VERIFYING_OTP: "Verifying code...",
		REDIRECTING_GOOGLE: "Redirecting to Google...",
		REDIRECTING_GITHUB: "Redirecting to GitHub...",
	},
} as const;

// Static list of countries (alternative to external API)
export const COUNTRIES = [
	"Afghanistan",
	"Albania",
	"Algeria",
	"Argentina",
	"Armenia",
	"Australia",
	"Austria",
	"Azerbaijan",
	"Bahrain",
	"Bangladesh",
	"Belarus",
	"Belgium",
	"Bolivia",
	"Brazil",
	"Bulgaria",
	"Cambodia",
	"Canada",
	"Chile",
	"China",
	"Colombia",
	"Croatia",
	"Czech Republic",
	"Denmark",
	"Ecuador",
	"Egypt",
	"Estonia",
	"Finland",
	"France",
	"Georgia",
	"Germany",
	"Ghana",
	"Greece",
	"Hungary",
	"Iceland",
	"India",
	"Indonesia",
	"Iran",
	"Iraq",
	"Ireland",
	"Israel",
	"Italy",
	"Japan",
	"Jordan",
	"Kazakhstan",
	"Kenya",
	"Kuwait",
	"Latvia",
	"Lebanon",
	"Lithuania",
	"Luxembourg",
	"Malaysia",
	"Mexico",
	"Morocco",
	"Netherlands",
	"New Zealand",
	"Nigeria",
	"Norway",
	"Pakistan",
	"Palestine",
	"Peru",
	"Philippines",
	"Poland",
	"Portugal",
	"Qatar",
	"Romania",
	"Russia",
	"Saudi Arabia",
	"Singapore",
	"Slovakia",
	"Slovenia",
	"South Africa",
	"South Korea",
	"Spain",
	"Sri Lanka",
	"Sweden",
	"Switzerland",
	"Syria",
	"Taiwan",
	"Thailand",
	"Turkey",
	"Ukraine",
	"United Arab Emirates",
	"United Kingdom",
	"United States",
	"Uruguay",
	"Venezuela",
	"Vietnam",
] as const;
