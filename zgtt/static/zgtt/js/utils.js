export function absURL(relative, base) {
  const url = new URL(relative, base)
  return url.href
}
export function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time))
}