import { lazy, Suspense } from "react";

const LibraryView = lazy(() =>
	import("@/widgets/Library/LibraryView/ui/LibraryView").then((m) => ({
		default: m.LibraryView,
	})),
);

export function LibraryPage() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center min-h-screen">
					<div className="animate-spin">
						<div className="w-8 h-8 border-4 border-gray-300 dark:border-slate-600 border-t-blue-500 rounded-full" />
					</div>
				</div>
			}
		>
			<LibraryView showSpecSelector={true} />
		</Suspense>
	);
}
