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