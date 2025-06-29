import type { z } from "zod";

/**
 * Configuration options for creating a TanStack Form
 */
export interface FormConfig<T extends Record<string, unknown>> {
	defaultValues: T;
	validationSchema?: z.ZodSchema<T>;
}

/**
 * Creates a standardized form configuration for TanStack Form
 * with Zod validation and consistent setup across the application
 * Note: With Zod 3.24.0+, the zodValidator adapter is no longer needed
 */
export function createFormConfig<T extends Record<string, unknown>>(
	config: FormConfig<T>,
) {
	const baseConfig = {
		defaultValues: config.defaultValues,
	};

	if (config.validationSchema) {
		return {
			...baseConfig,
			validators: {
				onChange: config.validationSchema,
			},
		};
	}

	return baseConfig;
}

/**
 * Type helper for form values
 */
export type FormValues<T> = T extends FormConfig<infer U> ? U : never;

/**
 * Common form configuration presets
 */
export const formPresets = {
	/**
	 * Basic text form with common validation
	 */
	textForm: <T extends Record<string, string>>(defaultValues: T) =>
		createFormConfig({
			defaultValues,
		}),

	/**
	 * Form with file upload capabilities
	 */
	fileForm: <T extends Record<string, unknown>>(
		defaultValues: T,
		validationSchema?: z.ZodSchema<T>,
	) =>
		createFormConfig({
			defaultValues,
			validationSchema,
		}),
} as const;
