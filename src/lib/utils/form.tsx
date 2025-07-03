import { cn } from "@/lib/utils/cn";

/**
 * Component for displaying field validation errors consistently
 */
export function FieldErrors({
	errors,
	className,
}: {
	errors: unknown[];
	className?: string;
}) {
	if (!errors || errors.length === 0) return null;

	// Convert errors to strings, handling different error types
	const errorMessages = errors
		.filter((error) => error != null)
		.map((error) => {
			if (typeof error === "string") return error;
			if (typeof error === "object" && error !== null && "message" in error) {
				return (error as { message: string }).message;
			}
			return String(error);
		});

	if (errorMessages.length === 0) return null;

	return (
		<div className={cn("space-y-1", className)}>
			{errorMessages.map((error) => (
				<p key={error} className="text-destructive text-sm">
					{error}
				</p>
			))}
		</div>
	);
}

/**
 * Converts a File to base64 string for form submission
 */
async function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () =>
			reject(new Error("Failed to convert file to base64"));
		reader.readAsDataURL(file);
	});
}

/**
 * File validation helpers for avatar uploads
 */
export const fileValidators = {
	maxSize: (maxSizeInMB: number) => (file: File) =>
		file.size > maxSizeInMB * 1024 * 1024
			? `File size must be less than ${maxSizeInMB}MB`
			: undefined,

	allowedTypes: (types: readonly string[]) => (file: File) =>
		!types.includes(file.type)
			? `File type must be one of: ${types.join(", ")}`
			: undefined,

	imageOnly: (file: File) =>
		!file.type.startsWith("image/") ? "File must be an image" : undefined,
} as const;

/**
 * Helper for file upload field value with base64 conversion
 */
export interface FileFieldValue {
	file: File | null;
	base64: string | null;
}

export async function createFileFieldValue(
	file: File | null,
): Promise<FileFieldValue> {
	if (!file) {
		return { file: null, base64: null };
	}

	const base64 = await fileToBase64(file);
	return { file, base64 };
}
