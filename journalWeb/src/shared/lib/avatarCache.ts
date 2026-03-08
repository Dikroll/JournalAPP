import { api } from '@/shared/api/instance'
import { apiConfig } from '@/shared/config/apiConfig'
import { storage } from '@/shared/lib/storage'

const AVATAR_TTL = 60 * 60 * 24 * 7
const memoryCache = new Map<string, string>()
const pending = new Map<string, Promise<string>>()

function storageKey(photoUrl: string) {
	return `cache:avatar:${photoUrl}`
}

export async function getAvatarUrl(photoUrl: string): Promise<string> {
	if (memoryCache.has(photoUrl)) return memoryCache.get(photoUrl)!

	const cached = storage.get<string>(storageKey(photoUrl))
	if (cached) {
		memoryCache.set(photoUrl, cached)
		return cached
	}

	if (pending.has(photoUrl)) return pending.get(photoUrl)!

	const promise = api
		.get(apiConfig.USER_AVATAR, { responseType: 'blob' })
		.then(res => {
			return new Promise<string>((resolve, reject) => {
				const reader = new FileReader()
				reader.onload = () => {
					const dataUrl = reader.result as string
					storage.set(storageKey(photoUrl), dataUrl, AVATAR_TTL)
					memoryCache.set(photoUrl, dataUrl)
					pending.delete(photoUrl)
					resolve(dataUrl)
				}
				reader.onerror = reject
				reader.readAsDataURL(res.data)
			})
		})
		.catch(() => {
			pending.delete(photoUrl)
			return photoUrl
		})

	pending.set(photoUrl, promise)
	return promise
}
