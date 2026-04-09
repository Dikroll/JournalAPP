import { create } from 'zustand'

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
	downloadProgress: number
	errorMessage: string | null

	setStatus: (s: UpdateStatus) => void
	setServerInfo: (info: AppVersionInfo) => void
	setProgress: (p: number) => void
	setError: (msg: string) => void
	reset: () => void
}

export const useAppUpdateStore = create<AppUpdateState>()(set => ({
	status: 'idle',
	serverInfo: null,
	downloadProgress: 0,
	errorMessage: null,

	setStatus: status => set({ status }),
	setServerInfo: serverInfo => set({ serverInfo }),
	setProgress: downloadProgress => set({ downloadProgress }),
	setError: errorMessage => set({ errorMessage, status: 'error' }),
	reset: () =>
		set({
			status: 'idle',
			downloadProgress: 0,
			errorMessage: null,
		}),
}))
