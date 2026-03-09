import { getPhotoUrl } from '@/shared/lib/photoCache'

export function usePhoto(url: string | null | undefined): string | null {
	return getPhotoUrl(url)
}
