function a() {
  console.log('a')
  console.log(this.userNode.username)
}

function b(metadata) {
  console.log('b')
  console.log(metadata)
}

function privateLogic() {
  console.log('private')
}

function c() {
  console.log('c')
  privateLogic()
}

function* g() {
  yield 1
  yield 2
}

function makePromise(delay, val) {
  return new Promise(resolve => {
    setTimeout(() => resolve(val), delay);
  });
}

async function* gg() {
  yield await makePromise(1000, 1)
  yield await makePromise(1000, 2)
}

const Plus = (_, a, b) => a + b
const Sum = (_, args) => args.reduce((a, b) => a + b, 0)

async function Fetch(_, type, name) {
  const data = new URLSearchParams();
  data.append('SearchTableName', 'Search/PRT_Product')
  data.append('ProjectName', name)
  data.append('Supply', '')
  data.append('MaxCost', '')
  data.append('Fans', '')
  data.append('Tag', '')
  data.append('Place', '')
  data.append('Position', '')
  data.append('ProductBrand', type)
  data.append('Order', '')

  const api = atob('aHR0cDovL3dvcmsudmlnbGxlLmNvbS9CYXNlVGFibGUvTGlzdA==')
  const response = await window.fetch(api, {
    body: data,
    method: "POST",
    mode: 'cors',
    credentials: "include"
  });
  return [type, name, await response.text()]
}

function Extract(_, [type, name, content]) {
  const element = document.createElement('div')
  element.innerHTML = content
  const target = element.querySelector('div.col-sm-2 > div:nth-child(4)')
  const gys = target ? target.innerText : null
  return [type, name, gys]
}

async function GenerateExcel({soul}, items) {
  const workbook = XLSX.utils.book_new()
  const sheet = XLSX.utils.json_to_sheet(items.map(item=>{
    let [type, name, gys] = item
    return {type, name, gys}
  }), {header:['type', 'name', 'gys']})
  XLSX.utils.book_append_sheet(workbook, sheet, "dshell");
  const options = { bookType: 'xlsx', bookSST: true, type: 'array' };
  const workbookOut = XLSX.write(workbook, options);
  return await soul.push(workbookOut, '/tmp/gys.xlsx')
}

async function Download({soul}, path) {
  const data = await soul.pull(path)
  const blob = new Blob([data], {type:"application/octet-stream"})
  const url = URL.createObjectURL(blob);
  const $stub = document.createElement("a");
  $stub.style.display = "none";
  document.body.appendChild($stub);
  $stub.href = url;
  $stub.download = path;
  $stub.click();
  $stub.remove();
  URL.revokeObjectURL(url);
  return path
}

async function Preview(_, path) {
  const url = `https://ipfs.io${path}`
  const previewUrl = `https://view.officeapps.live.com/op/view.aspx?src=${url}`
  window.open(previewUrl, '_blank')
}
export default [a, b, c, g, gg, Plus, Sum, Fetch, Extract, GenerateExcel, Download, Preview]