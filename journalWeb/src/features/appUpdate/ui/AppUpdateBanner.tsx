import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { isRemoteReleaseNewer } from "@/shared/lib/appRelease";
import { useAppUpdate } from "../hooks/useAppUpdate";
import { useAppUpdateStore } from "../model/store";

interface AppUpdateBannerProps {
	allowLatestReleaseFallback?: boolean;
}

export function AppUpdateBanner({
	allowLatestReleaseFallback = false,
}: AppUpdateBannerProps) {
	const { serverInfo, latestRelease, status } = useAppUpdate();
	const openSheet = useAppUpdateStore((s) => s.openSheet);
	const [isNewer, setIsNewer] = useState<boolean | null>(null);

	const releaseInfo =
		serverInfo ?? (allowLatestReleaseFallback ? latestRelease : null);

	// On Android, verify the release is actually newer than the installed version
	useEffect(() => {
		if (!releaseInfo) {
			setIsNewer(null);
			return;
		}

		// If serverInfo is set, checkForUpdate already verified it's newer
		if (serverInfo) {
			setIsNewer(true);
			return;
		}

		// For latestRelease fallback, we need to verify against current version
		let cancelled = false;
		(async () => {
			try {
				const { Capacitor } = await import("@capacitor/core");
				if (!Capacitor.isNativePlatform()) {
					// On web, show the banner (it links to download page)
					setIsNewer(true);
					return;
				}
				const { App } = await import("@capacitor/app");
				const appInfo = await App.getInfo();
				const currentBuild = parseInt(String(appInfo.build ?? "0"), 10);
				const currentVersion = String(appInfo.version ?? "0.0.0");

				if (!cancelled) {
					setIsNewer(
						isRemoteReleaseNewer({
							currentBuild,
							currentVersion,
							serverBuild: releaseInfo.build,
							serverVersion: releaseInfo.version,
						}),
					);
				}
			} catch {
				// Can't determine version — show the banner to be safe
				if (!cancelled) setIsNewer(true);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [releaseInfo, serverInfo]);

	if (!releaseInfo || isNewer === false || isNewer === null) return null;

	const isDownloading = status === "downloading";

	return (
		<button
			type="button"
			onClick={openSheet}
			disabled={isDownloading}
			className="w-full mb-3 flex items-center justify-between px-4 py-3.5 rounded-[18px] border disabled:opacity-60"
			style={{
				background:
					"linear-gradient(90deg, rgba(213,4,22,0.12), rgba(242,159,5,0.08))",
				borderColor: "rgba(213,4,22,0.3)",
			}}
		>
			<div className="flex items-center gap-3">
				<Download size={16} className="text-brand" />
				<div className="text-left">
					<p className="text-sm font-semibold text-app-text">
						Доступно обновление v{releaseInfo.version}
					</p>
					<p className="text-xs text-app-muted">
						{isDownloading
							? "Скачивание..."
							: "Нажмите чтобы скачать и установить"}
					</p>
				</div>
			</div>
			{!isDownloading && (
				<span className="text-xs font-semibold text-brand">Установить</span>
			)}
		</button>
	);
}

