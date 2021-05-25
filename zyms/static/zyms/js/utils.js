export function getPages(total, size) {
  let pages = parseInt(total / size);
  if (total % size !== 0) {
    pages ++;
  }
  return pages;
}