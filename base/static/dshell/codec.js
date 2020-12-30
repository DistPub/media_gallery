export function encode(data) {
  return encodeURI(JSON.stringify(data))
}

export function decode(data) {
  return JSON.parse(decodeURI(data))
}
