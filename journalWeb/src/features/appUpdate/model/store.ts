import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AppVersionInfo {
	version: string
	build: number
	apk_url: string
	changelog: string
}

type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'error'

interface AppUpdateState {
	status: UpdateStatus
	serverInfo: AppVersionInfo | null
	latestRelease: AppVersionInfo | null
	downloadProgress: number
	errorMessage: string | null

	setStatus: (s: UpdateStatus) => void
	setServerInfo: (info: AppVersionInfo) => void
	setLatestRelease: (info: AppVersionInfo) => void
	setProgress: (p: number) => void
	setError: (msg: string) => void
	reset: () => void
	openSheet: () => void
}

export const useAppUpdateStore = create<AppUpdateState>()(
	persist(
		set => ({
			status: 'idle',
			serverInfo: null,
			latestRelease: null,
			downloadProgress: 0,
			errorMessage: null,

			setStatus: status => set({ status }),
			setServerInfo: serverInfo => set({ serverInfo }),
			setLatestRelease: latestRelease => set({ latestRelease }),
			setProgress: downloadProgress => set({ downloadProgress }),
			setError: errorMessage => set({ errorMessage, status: 'error' }),
			reset: () =>
				set({
					status: 'idle',
					downloadProgress: 0,
					errorMessage: null,
				}),
			openSheet: () =>
				set(state => {
					if (state.serverInfo) return { status: 'available' }
					return {}
				}),
		}),
		{
			name: 'app-update-store',
			partialize: state => ({ latestRelease: state.latestRelease }),
		},
	),
)
