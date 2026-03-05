
import { api } from "@/shared/api/instance"
import { apiConfig } from "@/shared/config/apiConfig"

const cache = new Map<string, string>()

const pending = new Map<string, Promise<string>>()

export async function getAvatarUrl(photoUrl: string): Promise<string> {
  if (cache.has(photoUrl)) return cache.get(photoUrl)!

  if (pending.has(photoUrl)) return pending.get(photoUrl)!

  const promise = api
    .get(apiConfig.USER_AVATAR, { responseType: "blob" })
    .then((res) => {
      const url = URL.createObjectURL(res.data)
      cache.set(photoUrl, url)
      pending.delete(photoUrl)
      return url
    })
    .catch(() => {
      pending.delete(photoUrl)
      return photoUrl
    })

  pending.set(photoUrl, promise)
  return promise
}