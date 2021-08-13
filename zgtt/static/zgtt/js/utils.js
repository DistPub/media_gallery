export function absURL(relative, base) {
  const url = new URL(relative, base)
  return url.href
}
