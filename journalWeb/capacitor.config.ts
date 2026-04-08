import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
	appId: 'com.Dikroll.Journal',
	appName: 'Journal-v',
	webDir: 'dist',
	plugins: {
		CapacitorApkInstaller: {
			ios: {
				enabled: false,
			},
		},
	},
}

export default config
