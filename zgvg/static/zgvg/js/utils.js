const ids = {}

export function generateID(prefix) {
  if (!ids.hasOwnProperty(prefix)) {
    ids[prefix] = 1
  }
  const id = `${prefix}${ids[prefix]}`
  ids[prefix] ++
  console.log(id)
  return id
}

export function absURL(relative, base) {
  const url = new URL(relative, base)
  return url.href
}
