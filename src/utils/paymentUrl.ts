/** Make Google Drive payment links usable in <img> tags. */
export function toDisplayPaymentUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('data:')) return url

  const idMatch =
    url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
    url.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/)

  if (idMatch?.[1]) {
    return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1200`
  }

  return url
}
