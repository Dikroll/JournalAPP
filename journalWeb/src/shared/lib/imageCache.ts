const cache = new Map<string, string>()

export async function getCachedImageUrl(url: string): Promise<string> {
  if (cache.has(url)) return cache.get(url) ?? ''
  
  const res = await fetch(url)
  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  cache.set(url, objectUrl)
  return objectUrl
}