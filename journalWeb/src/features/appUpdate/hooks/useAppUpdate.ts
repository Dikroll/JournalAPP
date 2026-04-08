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
	const {
		status,
		serverInfo,
		downloadProgress,
		errorMessage,
		setStatus,
		setServerInfo,
		setProgress,
		setError,
		reset,
	} = useAppUpdateStore()

	const checkForUpdate = useCallback(async () => {
		await loadPlugins()

		if (!Capacitor?.isNativePlatform()) return

		setStatus('checking')

		try {
			const appInfo = await App.getInfo()
			const currentBuild = parseInt(String(appInfo.build ?? '0'), 10)
			const currentVersion = String(appInfo.version ?? '0.0.0')

			const releaseInfo = await fetchLatestAppRelease()

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
	}, [setStatus, setServerInfo])

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

			const response = await fetch(serverInfo.apk_url)
			if (!response.ok) throw new Error(`HTTP ${response.status}`)

			const contentLength = response.headers.get('content-length')
			const total = contentLength ? parseInt(contentLength, 10) : 0
			const reader = response.body?.getReader()
			if (!reader) throw new Error('No response body')

			const chunks: Uint8Array[] = []
			let received = 0

			while (true) {
				const { done, value } = await reader.read()
				if (done) break
				chunks.push(value)
				received += value.length
				if (total > 0) {
					setProgress(Math.round((received / total) * 100))
				}
			}

			const merged = new Uint8Array(received)
			let offset = 0
			for (const chunk of chunks) {
				merged.set(chunk, offset)
				offset += chunk.length
			}

			let binary = ''
			const CHUNK = 8192
			for (let i = 0; i < merged.length; i += CHUNK) {
				binary += String.fromCharCode(...merged.subarray(i, i + CHUNK))
			}
			const base64 = btoa(binary)

			const fileName = `update-${serverInfo.version}.apk`

			await Filesystem.writeFile({
				path: fileName,
				data: base64,
				directory: Directory.Cache,
			})

			const { uri } = await Filesystem.getUri({
				path: fileName,
				directory: Directory.Cache,
			})

			setProgress(100)

			await ApkInstaller.installApk({ filePath: uri })

			reset()
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : 'Ошибка скачивания'
			setError(msg)
		}
	}, [serverInfo, setStatus, setProgress, setError, reset])

	return {
		status,
		serverInfo,
		downloadProgress,
		errorMessage,
		checkForUpdate,
		downloadAndInstall,
		dismiss: reset,
	}
}
