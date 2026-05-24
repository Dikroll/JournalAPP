import { useCallback } from 'react'
import {
	fetchLatestAppRelease,
	isRemoteReleaseNewer,
} from '@/shared/lib/appRelease'
import { useAppUpdateStore } from '../model/store'

let _loaded = false
let App: any = null
let Filesystem: any = null
let Directory: any = null
let ApkInstaller: any = null
let Capacitor: any = null

async function loadPlugins() {
	if (_loaded) return
	_loaded = true

	try {
		const cap = await import('@capacitor/core')
		Capacitor = cap.Capacitor
		if (!Capacitor.isNativePlatform()) return

		const appMod = await import('@capacitor/app')
		App = appMod.App

		const fsMod = await import('@capacitor/filesystem')
		Filesystem = fsMod.Filesystem
		Directory = fsMod.Directory

		const installerMod = await import('@bixbyte/capacitor-apk-installer')
		ApkInstaller = installerMod.ApkInstaller
	} catch {}
}

export function useAppUpdate() {
	const status = useAppUpdateStore(s => s.status)
	const serverInfo = useAppUpdateStore(s => s.serverInfo)
	const latestRelease = useAppUpdateStore(s => s.latestRelease)
	const downloadProgress = useAppUpdateStore(s => s.downloadProgress)
	const errorMessage = useAppUpdateStore(s => s.errorMessage)
	const setStatus = useAppUpdateStore(s => s.setStatus)
	const setServerInfo = useAppUpdateStore(s => s.setServerInfo)
	const setLatestRelease = useAppUpdateStore(s => s.setLatestRelease)
	const setProgress = useAppUpdateStore(s => s.setProgress)
	const setError = useAppUpdateStore(s => s.setError)
	const reset = useAppUpdateStore(s => s.reset)

	const checkForUpdate = useCallback(async () => {
		await loadPlugins()

		try {
				const releaseInfo = await fetchLatestAppRelease()
			setLatestRelease(releaseInfo)

			if (Capacitor?.getPlatform() !== 'android') return

			setStatus('checking')

			const appInfo = await App.getInfo()
			const currentBuild = parseInt(String(appInfo.build ?? '0'), 10)
			const currentVersion = String(appInfo.version ?? '0.0.0')

			console.log(`[AppUpdate] current=${currentVersion} (${currentBuild}), server=${releaseInfo.version} (${releaseInfo.build})`)

			if (
				isRemoteReleaseNewer({
					currentBuild,
					currentVersion,
					serverBuild: releaseInfo.build,
					serverVersion: releaseInfo.version,
				})
			) {
				setServerInfo(releaseInfo)
				setStatus('available')
			} else {
				setStatus('idle')
			}
		} catch (error) {
			console.warn('App update check failed', error)
			setStatus('idle')
		}
	}, [setStatus, setServerInfo, setLatestRelease])

	const downloadAndInstall = useCallback(async () => {
		if (!serverInfo || !Filesystem || !ApkInstaller) return

		setStatus('downloading')
		setProgress(0)

		try {
			const { hasPermission } = await ApkInstaller.checkInstallPermission()

			if (!hasPermission) {
				await ApkInstaller.requestInstallPermission()
				setStatus('available')
				return
			}

			const fileName = `update-${serverInfo.version}.apk`

			const progressListener = await Filesystem.addListener(
				'progress',
				(event: { bytes: number; contentLength: number }) => {
					if (event.contentLength > 0) {
						setProgress(Math.round((event.bytes / event.contentLength) * 100))
					}
				},
			)

			try {
				await Filesystem.downloadFile({
					url: serverInfo.apk_url,
					path: fileName,
					directory: Directory.Cache,
					progress: true,
				})
			} finally {
				progressListener.remove()
			}

			const { uri } = await Filesystem.getUri({
				path: fileName,
				directory: Directory.Cache,
			})

			setProgress(100)

			// Некоторые версии плагина ожидают путь без file:// префикса
			const filePath = uri.startsWith('file://') ? uri.slice(7) : uri
			await ApkInstaller.installApk({ filePath })

			reset()
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : 'Ошибка скачивания'
			setError(msg)
		}
	}, [serverInfo, setStatus, setProgress, setError, reset])

	return {
		status,
		serverInfo,
		latestRelease,
		downloadProgress,
		errorMessage,
		checkForUpdate,
		downloadAndInstall,
		dismiss: reset,
	}
}
