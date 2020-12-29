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
const Sum = (_, args) => {
  let amount = 0
  for (const item of args) {
    amount = amount + item
  }
  return amount
}

export default [a, b, c, g, gg, Plus, Sum]