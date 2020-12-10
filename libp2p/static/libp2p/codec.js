export function encode(data) {
  return window.encodeURI(JSON.stringify(data))
}

export function decode(data) {
  return JSON.parse(window.decodeURI(data))
}
