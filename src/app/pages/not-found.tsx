import { link } from "@/lib/utils/links";

export function NotFound() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<h1 className="font-bold text-6xl text-muted-foreground">404</h1>
				<h2 className="mt-4 font-semibold text-2xl">Page Not Found</h2>
				<p className="mt-2 text-muted-foreground">
					The page you're looking for doesn't exist.
				</p>
				<a
					href={link("/")}
					className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
				>
					Go Home
				</a>
			</div>
		</div>
	);
}
