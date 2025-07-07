// Not in use, but keeping for reference as alternative
// to hydration warning suppression in src/client.tsx

"use client";

import { type ReactNode, useEffect, useState } from "react";

interface ClientOnlyProps {
	children: ReactNode;
	fallback?: ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	if (!hasMounted) {
		return fallback;
	}

	return <>{children}</>;
}
