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

export default [a, b, c, g, gg]
