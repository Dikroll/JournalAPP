import { storage } from "./storage"

export async function cachedFetch<T>(opts: {
  key: string
  fetcher: () => Promise<T>
  ttlSeconds: number
  onData: (data: T, isStale: boolean) => void
  onError?: (err: unknown) => void
}): Promise<void> {
  const { key, fetcher, ttlSeconds, onData, onError } = opts

  const fresh = storage.get<T>(key)
  if (fresh) {
    onData(fresh, false)
    return
  }

  const stale = storage.getStale<T>(key)
  if (stale) {
    onData(stale, true)
  }

  try {
    const data = await fetcher()
    onData(data, false)
    storage.set(key, data, ttlSeconds)
  } catch (err) {
    onError?.(err)
  }
}