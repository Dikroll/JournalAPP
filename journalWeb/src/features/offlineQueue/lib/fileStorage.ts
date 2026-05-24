import { Capacitor } from '@capacitor/core'

let Filesystem: typeof import('@capacitor/filesystem').Filesystem | null = null
let Directory: typeof import('@capacitor/filesystem').Directory | null = null

async function ensureFs() {
	if (Filesystem) return
	const mod = await import('@capacitor/filesystem')
	Filesystem = mod.Filesystem
	Directory = mod.Directory
}

function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => {
			const result = reader.result as string
			resolve(result.split(',')[1])
		}
		reader.onerror = reject
		reader.readAsDataURL(file)
	})
}

function base64ToBlob(base64: string, mimeType: string): Blob {
	const bytes = atob(base64)
	const arr = new Uint8Array(bytes.length)
	for (let i = 0; i < bytes.length; i++) {
		arr[i] = bytes.charCodeAt(i)
	}
	return new Blob([arr], { type: mimeType })
}

export async function saveFileForQueue(
	file: File,
	queueId: string,
): Promise<string> {
	const base64 = await fileToBase64(file)

	if (Capacitor.isNativePlatform()) {
		await ensureFs()
		const path = `offline-queue/${queueId}-${file.name}`
		await Filesystem!.writeFile({
			path,
			data: base64,
			directory: Directory!.Data,
			recursive: true,
		})
		return path
	}

	localStorage.setItem(`oq-file:${queueId}`, base64)
	return `local:${queueId}`
}

export async function readFileFromQueue(
	path: string,
	fileName: string,
	mimeType: string,
): Promise<File> {
	if (Capacitor.isNativePlatform()) {
		await ensureFs()
		const result = await Filesystem!.readFile({
			path,
			directory: Directory!.Data,
		})
		const blob = base64ToBlob(result.data as string, mimeType)
		return new File([blob], fileName, { type: mimeType })
	}

	const queueId = path.replace('local:', '')
	const base64 = localStorage.getItem(`oq-file:${queueId}`)
	if (!base64) throw new Error('Файл не найден в кэше')
	const blob = base64ToBlob(base64, mimeType)
	return new File([blob], fileName, { type: mimeType })
}

export async function deleteQueueFile(path: string): Promise<void> {
	if (Capacitor.isNativePlatform()) {
		await ensureFs()
		try {
			await Filesystem!.deleteFile({ path, directory: Directory!.Data })
		} catch {}
		return
	}

	const queueId = path.replace('local:', '')
	localStorage.removeItem(`oq-file:${queueId}`)
}

export async function clearAllQueueFiles(): Promise<void> {
	if (Capacitor.isNativePlatform()) {
		await ensureFs()
		try {
			await Filesystem!.rmdir({
				path: 'offline-queue',
				directory: Directory!.Data,
				recursive: true,
			})
		} catch {}
		return
	}

	Object.keys(localStorage)
		.filter(k => k.startsWith('oq-file:'))
		.forEach(k => localStorage.removeItem(k))
}
