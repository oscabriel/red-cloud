"use client";

import { useTransition } from "react";

import { prepareFormData } from "./utils";

/**
 * Configuration for server form submission hook
 */
export interface ServerFormSubmissionConfig<T extends Record<string, unknown>> {
	serverAction: (
		data: Record<string, unknown>,
	) => Promise<{ success: boolean; error?: string | Error }>;
	onSuccess?: (data: T) => void;
	onError?: (error: string | Error) => void;
}

/**
 * Hook for integrating TanStack Form with RedwoodSDK server functions
 * Handles form submission with plain objects compatible with realtime client
 */
export function useServerFormSubmission<T extends Record<string, unknown>>(
	config: ServerFormSubmissionConfig<T>,
) {
	const [isPending, startTransition] = useTransition();

	const handleSubmit = async (formState: T) => {
		startTransition(async () => {
			try {
				// Prepare plain object for server function (realtime compatible!)
				const preparedData = prepareFormData(formState);
				const result = await config.serverAction(preparedData);

				if (result.success) {
					config.onSuccess?.(formState);
				} else {
					config.onError?.(result.error || "Unknown error");
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error : "Unknown error";
				config.onError?.(errorMessage);
			}
		});
	};

	return { handleSubmit, isPending };
}

/**
 * Type helper for server action responses
 */
export interface ServerActionResponse<T = unknown> {
	success: boolean;
	error?: string | Error;
	data?: T;
}

/**
 * Helper to create consistent server action response
 */
export function createServerResponse<T = unknown>(
	success: boolean,
	error?: string | Error,
	data?: T,
): ServerActionResponse<T> {
	return { success, error, data };
}

/**
 * Type guard for server action responses
 */
export function isServerActionResponse(
	value: unknown,
): value is ServerActionResponse {
	return (
		typeof value === "object" &&
		value !== null &&
		"success" in value &&
		typeof (value as { success: unknown }).success === "boolean"
	);
}
