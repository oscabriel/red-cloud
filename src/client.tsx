import { initClientNavigation } from "rwsdk/client";
import { initRealtimeClient } from "rwsdk/realtime/client";

// Suppress hydration warnings for Radix UI ID mismatches
if (typeof window !== "undefined") {
	const originalError = console.error;
	console.error = (...args) => {
		if (
			typeof args[0] === "string" &&
			args[0].includes("A tree hydrated but some attributes")
		) {
			return;
		}
		originalError(...args);
	};
}

initRealtimeClient({
	key: window.location.pathname,
});

initClientNavigation();
