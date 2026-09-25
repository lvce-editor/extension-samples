const cacheName = 'lvce-playground-generated-bundles'

export const storeGeneratedBundle = async (content: string): Promise<string> => {
  const url = new URL(`.generated/${crypto.randomUUID()}.js`, location.href).href
  const cache = await caches.open(cacheName)
  await cache.put(url, new Response(content, { headers: { 'Content-Type': 'text/javascript' } }))
  return url
}

export const deleteGeneratedBundle = async (url: string): Promise<void> => {
  const cache = await caches.open(cacheName)
  await cache.delete(url)
}

export const readGeneratedBundle = async (url: string): Promise<Response> => {
  const cache = await caches.open(cacheName)
  return (await cache.match(url)) || fetch(url)
}
